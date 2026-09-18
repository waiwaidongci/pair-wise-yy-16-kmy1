import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";

const BASE = "http://localhost:5173";
const SHOTS = new URL("./shots/", import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });

const data = JSON.parse(
  readFileSync(new URL("../starter/src/data/photos.json", import.meta.url), "utf8"),
);
const photoById = Object.fromEntries(data.photos.map((p) => [p.id, p]));

let failures = 0;
function check(name, cond, extra = "") {
  const tag = cond ? "PASS" : "FAIL";
  if (!cond) failures++;
  console.log(`  [${tag}] ${name}${extra ? ` — ${extra}` : ""}`);
}

const browser = await chromium.launch();

/** Scroll through the page so lazy-loaded images fetch, then settle back at top. */
async function settleForScreenshot(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(400);
}

async function newPage(viewport) {
  const page = await browser.newPage({ viewport });
  page.consoleErrors = [];
  page.on("pageerror", (e) => page.consoleErrors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") page.consoleErrors.push(m.text());
  });
  return page;
}

/* ============ 1. Pages render + no external font requests (constraint 6) ============ */
console.log("\n== Pages render & font requests ==");
{
  const page = await newPage({ width: 1440, height: 900 });
  const requests = [];
  page.on("request", (r) => requests.push(r.url()));

  for (const [path, selector, label] of [
    ["/", ".hero__name", "home"],
    ["/work", ".masonry", "work"],
    ["/work/gaze", ".series-hero__title", "series"],
    ["/about", ".timeline", "about"],
    ["/contact", ".contact-form", "contact"],
  ]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    check(`${label} (${path}) renders`, (await page.locator(selector).count()) === 1);
  }

  const external = requests.filter((u) =>
    /fonts\.googleapis\.com|fonts\.gstatic\.com|googleapis|gstatic|cdn\.jsdelivr|unpkg/.test(u),
  );
  check("no external font/CDN requests", external.length === 0, external.join(", ") || "none found");

  const fontReqs = requests.filter((u) => u.includes("/fonts/"));
  for (const f of ["inter-400-600.woff2", "playfair-display-600.woff2"]) {
    check(`local font loaded: ${f}`, fontReqs.some((u) => u.endsWith(f)));
  }

  const fontsReady = await page.evaluate(() => ({
    inter: document.fonts.check("16px Inter"),
    playfair: document.fonts.check('600 16px "Playfair Display"'),
  }));
  check("Inter available to canvas", fontsReady.inter);
  check("Playfair 600 available", fontsReady.playfair);

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await settleForScreenshot(page);
  await page.screenshot({ path: SHOTS + "01-home.png", fullPage: true });
  check("no console errors on tour", page.consoleErrors.length === 0, page.consoleErrors.join(" | "));
  await page.close();
}

/* ============ 2. Work page: filter + masonry + aspect-ratio reservation (constraint 3) ============ */
console.log("\n== Work page: filter, masonry, reserved aspect ratios ==");
{
  const page = await newPage({ width: 1440, height: 900 });

  // Block all photo requests: placeholders must still have correct ratios.
  await page.route("**/photos/**", (route) => route.abort());
  await page.goto(BASE + "/work");
  await page.waitForSelector(".work-card");

  const ratios = await page.evaluate(() =>
    [...document.querySelectorAll(".work-card .ph")].map((el) => {
      const img = el.querySelector("img");
      const r = el.getBoundingClientRect();
      return {
        id: img.getAttribute("src"),
        w: Number(img.getAttribute("width")),
        h: Number(img.getAttribute("height")),
        rendered: r.width / r.height,
      };
    }),
  );
  check("14 cards rendered with images blocked", ratios.length === 14);
  const bad = ratios.filter(
    (r) => Math.abs(r.rendered - r.w / r.h) / (r.w / r.h) > 0.03,
  );
  check("all placeholders match true aspect ratio (±3%)", bad.length === 0,
    bad.map((b) => `${b.id}: ${b.rendered.toFixed(3)} vs ${(b.w / b.h).toFixed(3)}`).join("; "));

  await page.unroute("**/photos/**");
  page.consoleErrors = []; // aborted image requests above log expected ERR_FAILED entries
  await page.goto(BASE + "/work", { waitUntil: "networkidle" });

  const colCount = await page.locator(".masonry").evaluate((el) => getComputedStyle(el).columnCount);
  check("desktop masonry is multi-column", colCount === "3", `column-count=${colCount}`);

  // Filter chips
  await page.getByRole("button", { name: "牧野", exact: true }).click();
  check("pastoral filter shows 4 cards", (await page.locator(".work-card").count()) === 4);
  const activeChip = await page.locator(".chip.is-active").textContent();
  check("牧野 chip is active", activeChip.trim() === "牧野");
  await settleForScreenshot(page);
  await page.screenshot({ path: SHOTS + "02-work-filtered-pastoral.png", fullPage: true });

  await page.getByRole("button", { name: "All", exact: true }).click();
  check("All filter shows 14 cards", (await page.locator(".work-card").count()) === 14);
  await settleForScreenshot(page);
  await page.screenshot({ path: SHOTS + "03-work-all.png", fullPage: true });
  check("no console errors", page.consoleErrors.length === 0, page.consoleErrors.join(" | "));
  await page.close();
}

/* ============ 3. Filter persists across navigation (constraint 1) ============ */
console.log("\n== Filter persists across navigation ==");
{
  const page = await newPage({ width: 1440, height: 900 });
  await page.goto(BASE + "/work", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "风光", exact: true }).click();
  check("landscape filter → 5 cards", (await page.locator(".work-card").count()) === 5);

  // Navigate into a series detail page via the card's series link
  await page.locator(".work-card__series").first().click();
  await page.waitForSelector(".series-hero__title");
  check("landed on series page", page.url().includes("/work/wilderness"),
    await page.locator(".series-hero__title").textContent());

  // Back via in-page link
  await page.getByRole("link", { name: "← Back to Work" }).click();
  await page.waitForSelector(".masonry");
  check("URL back at /work", new URL(page.url()).pathname === "/work");
  check("filter still 风光 after in-app back", (await page.locator(".chip.is-active").textContent()).trim() === "风光");
  check("still 5 cards after in-app back", (await page.locator(".work-card").count()) === 5);

  // Also via browser history back
  await page.locator(".work-card__series").first().click();
  await page.waitForSelector(".series-hero__title");
  await page.goBack();
  await page.waitForSelector(".masonry");
  check("filter still 风光 after browser back", (await page.locator(".chip.is-active").textContent()).trim() === "风光");
  check("still 5 cards after browser back", (await page.locator(".work-card").count()) === 5);
  check("no console errors", page.consoleErrors.length === 0, page.consoleErrors.join(" | "));
  await page.close();
}

/* ============ 4. Lightbox scoped to filtered list (constraint 2) ============ */
console.log("\n== Lightbox navigation scoped to current filter ==");
{
  const page = await newPage({ width: 1440, height: 900 });
  await page.goto(BASE + "/work", { waitUntil: "networkidle" });

  // All photos: counter out of 14
  await page.locator(".work-card__btn").first().click();
  await page.waitForSelector(".lightbox");
  check("lightbox opens (all)", (await page.locator(".lightbox__counter").textContent()).trim() === "1 / 14");
  await page.keyboard.press("Escape");
  await page.waitForSelector(".lightbox", { state: "detached" });
  check("Escape closes lightbox", (await page.locator(".lightbox").count()) === 0);

  // Filter 牧野 → lightbox must cycle within the 4 pastoral photos only
  await page.getByRole("button", { name: "牧野", exact: true }).click();
  await page.locator(".work-card__btn").first().click();
  await page.waitForSelector(".lightbox");
  check("counter starts 1 / 4", (await page.locator(".lightbox__counter").textContent()).trim() === "1 / 4");

  const pastoralTitles = data.photos.filter((p) => p.category === "pastoral").map((p) => p.title);
  const seen = [];
  for (let i = 0; i < 4; i++) {
    seen.push((await page.locator(".lightbox__title").textContent()).trim());
    await page.locator(".lightbox__arrow--next").click();
  }
  check("next×4 stays inside pastoral set", seen.every((t) => pastoralTitles.includes(t)), seen.join(", "));
  check("wraps around to 1 / 4", (await page.locator(".lightbox__counter").textContent()).trim() === "1 / 4");

  await page.locator(".lightbox__arrow--prev").click();
  check("prev wraps to 4 / 4", (await page.locator(".lightbox__counter").textContent()).trim() === "4 / 4");
  const wrappedTitle = (await page.locator(".lightbox__title").textContent()).trim();
  check("prev-wrap lands on a pastoral photo", pastoralTitles.includes(wrappedTitle), wrappedTitle);

  // Keyboard navigation
  await page.keyboard.press("ArrowLeft");
  check("ArrowLeft navigates", (await page.locator(".lightbox__counter").textContent()).trim() === "3 / 4");

  // Caption content from data
  const caption = (await page.locator(".lightbox__text").textContent()).trim();
  const expected = data.photos.find((p) => p.category === "pastoral" && p.order === 3).caption;
  check("caption text matches photos.json", caption === expected, caption);

  // Desktop: caption is a floating overlay (absolute)
  const capPos = await page.locator(".lightbox__caption").evaluate((el) => getComputedStyle(el).position);
  check("desktop caption is side overlay (absolute)", capPos === "absolute", capPos);
  await page.screenshot({ path: SHOTS + "04-lightbox-desktop.png" });
  check("no console errors", page.consoleErrors.length === 0, page.consoleErrors.join(" | "));
  await page.close();
}

/* ============ 5. Series detail page shares the data model (constraint 4) ============ */
console.log("\n== Series detail page ==");
{
  const page = await newPage({ width: 1440, height: 900 });
  const series = data.series.find((s) => s.id === "gaze");
  await page.goto(BASE + "/work/gaze", { waitUntil: "networkidle" });

  check("series title from data", (await page.locator(".series-hero__title").textContent()).trim() === series.title);
  check("series summary from data", (await page.locator(".series-hero__summary").textContent()).trim() === series.summary);
  check("all 5 series photos rendered", (await page.locator(".series-row").count()) === series.photoIds.length);

  const titles = await page.locator(".series-row__title").allTextContents();
  const expectedTitles = series.photoIds.map((id) => photoById[id].title);
  check("row titles match photos.json order", JSON.stringify(titles.map((t) => t.trim())) === JSON.stringify(expectedTitles), titles.join(", "));

  const quote = (await page.locator(".pull-quote p").textContent()).replace(/[“”]/g, "").trim();
  const fromData = data.photos.some((p) => p.caption === quote);
  check("pull-quote sourced from photos.json", fromData, quote);

  // The pull-quote uses the italic Playfair face — it must load locally.
  const italicLoaded = await page.evaluate(async () => {
    await document.fonts.load('italic 16px "Playfair Display"');
    return document.fonts.check('italic 16px "Playfair Display"');
  });
  check("Playfair italic loads locally", italicLoaded);

  // Lightbox on series page navigates within series photos
  await page.locator(".series-row__media").first().click();
  await page.waitForSelector(".lightbox");
  check("series lightbox counter 1 / 5", (await page.locator(".lightbox__counter").textContent()).trim() === "1 / 5");
  await page.keyboard.press("Escape");

  // Detail-page images also reserve their true aspect ratio before load.
  await page.route("**/photos/**", (route) => route.abort());
  await page.goto(BASE + "/work/gaze");
  await page.waitForSelector(".series-row");
  const rowRatios = await page.evaluate(() =>
    [...document.querySelectorAll(".series-row__media .ph")].map((el) => {
      const img = el.querySelector("img");
      const r = el.getBoundingClientRect();
      return { w: Number(img.getAttribute("width")), h: Number(img.getAttribute("height")), rendered: r.width / r.height };
    }),
  );
  const badRows = rowRatios.filter((r) => Math.abs(r.rendered - r.w / r.h) / (r.w / r.h) > 0.03);
  check("series rows reserve true aspect ratio (images blocked)", badRows.length === 0,
    badRows.map((b) => `${b.rendered.toFixed(3)} vs ${(b.w / b.h).toFixed(3)}`).join("; "));
  await page.unroute("**/photos/**");
  page.consoleErrors = []; // aborted image requests log expected ERR_FAILED entries
  await page.goto(BASE + "/work/gaze", { waitUntil: "networkidle" });

  await settleForScreenshot(page);
  await page.screenshot({ path: SHOTS + "05-series.png", fullPage: true });

  // Unknown series → not found state
  await page.goto(BASE + "/work/nope");
  check("unknown series shows not-found", (await page.locator(".page-title").textContent()).includes("Not found"));
  check("no console errors", page.consoleErrors.length === 0, page.consoleErrors.join(" | "));
  await page.close();
}

/* ============ 6. Mobile responsive (constraint 5) ============ */
console.log("\n== Mobile responsive (390px) ==");
{
  const page = await newPage({ width: 390, height: 844 });
  await page.goto(BASE + "/work", { waitUntil: "networkidle" });

  const colCount = await page.locator(".masonry").evaluate((el) => getComputedStyle(el).columnCount);
  check("mobile masonry is single column", colCount === "1", `column-count=${colCount}`);

  const metaVisible = await page.locator(".work-card__meta").first().isVisible();
  check("mobile shows static caption under photo", metaVisible);

  // Hamburger menu
  const toggleVisible = await page.locator(".nav-toggle").isVisible();
  check("hamburger visible on mobile", toggleVisible);
  await page.locator(".nav-toggle").click();
  check("menu opens", await page.locator(".site-nav.is-open").isVisible());
  await page.locator(".site-nav__link", { hasText: "Work" }).click();
  await page.waitForSelector(".masonry");
  check("menu navigates and closes", (await page.locator(".site-nav.is-open").count()) === 0);

  // Lightbox: caption becomes a bottom bar
  await page.locator(".work-card__btn").first().click();
  await page.waitForSelector(".lightbox");
  const capPos = await page.locator(".lightbox__caption").evaluate((el) => getComputedStyle(el).position);
  check("mobile caption is bottom bar (static)", capPos === "static", capPos);
  const boxes = await page.evaluate(() => {
    const img = document.querySelector(".lightbox__img").getBoundingClientRect();
    const cap = document.querySelector(".lightbox__caption").getBoundingClientRect();
    return { imgBottom: img.bottom, capTop: cap.top, capLeft: cap.left };
  });
  check("caption sits below image", boxes.capTop >= boxes.imgBottom - 1,
    `capTop=${boxes.capTop} imgBottom=${boxes.imgBottom}`);
  await page.waitForTimeout(500); // let the fade-in finish before capturing
  await page.screenshot({ path: SHOTS + "06-lightbox-mobile.png" });
  await page.keyboard.press("Escape");
  await settleForScreenshot(page);
  await page.screenshot({ path: SHOTS + "07-work-mobile.png", fullPage: true });
  check("no console errors", page.consoleErrors.length === 0, page.consoleErrors.join(" | "));
  await page.close();
}

/* ============ 7. Contact form (constraint 7) ============ */
console.log("\n== Contact form validation & feedback ==");
{
  const page = await newPage({ width: 1440, height: 900 });
  await page.goto(BASE + "/contact", { waitUntil: "networkidle" });

  const submit = page.locator(".contact-form__submit");
  check("submit disabled when empty", await submit.isDisabled());

  // Touch fields → inline errors appear
  await page.locator("#contact-name").click();
  await page.locator("#contact-name").blur();
  await page.locator("#contact-email").fill("not-an-email");
  await page.locator("#contact-email").blur();
  await page.locator("#contact-message").fill("hi");
  await page.locator("#contact-message").blur();

  check("name required error shown", await page.locator("#contact-name-error").isVisible());
  check("email format error shown", (await page.locator("#contact-email-error").textContent()).includes("valid email"));
  check("message length error shown", await page.locator("#contact-message-error").isVisible());
  check("submit still disabled with errors", await submit.isDisabled());
  await page.screenshot({ path: SHOTS + "08-contact-errors.png" });

  // Fix fields → errors clear, submit enables
  await page.locator("#contact-name").fill("Li Wei");
  await page.locator("#contact-email").fill("liwei@example.com");
  await page.locator("#contact-message").fill("Hello, I would like to ask about a print.");
  check("errors clear when valid", (await page.locator(".field__error").count()) === 0);
  check("submit enabled when valid", await submit.isEnabled());

  await submit.click();
  await page.waitForSelector(".form-success", { timeout: 5000 });
  check("success feedback shown", await page.locator(".form-success__title").isVisible());
  check("form replaced by success state", (await page.locator(".contact-form").count()) === 0);
  await page.screenshot({ path: SHOTS + "09-contact-success.png" });

  await page.getByRole("button", { name: "Send another message" }).click();
  check("can reset to a fresh form", await page.locator(".contact-form").isVisible());
  check("no console errors", page.consoleErrors.length === 0, page.consoleErrors.join(" | "));
  await page.close();
}

/* ============ 8. About page ============ */
console.log("\n== About page ==");
{
  const page = await newPage({ width: 1440, height: 900 });
  await page.goto(BASE + "/about", { waitUntil: "networkidle" });
  check("timeline has entries", (await page.locator(".timeline__item").count()) >= 4);
  await settleForScreenshot(page);
  await page.screenshot({ path: SHOTS + "10-about.png", fullPage: true });
  check("no console errors", page.consoleErrors.length === 0, page.consoleErrors.join(" | "));
  await page.close();
}

await browser.close();
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
