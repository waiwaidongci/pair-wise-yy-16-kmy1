import { useMemo, useState, type FormEvent } from "react";

interface FormValues {
  name: string;
  email: string;
  message: string;
}

type Touched = Partial<Record<keyof FormValues, boolean>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormValues) {
  const errors: Partial<Record<keyof FormValues, string>> = {};
  if (!values.name.trim()) {
    errors.name = "Please tell me your name.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name needs at least 2 characters.";
  }
  if (!values.email.trim()) {
    errors.email = "An email address is required so I can reply.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "That email address doesn't look right.";
  }
  if (!values.message.trim()) {
    errors.message = "Please write a few words about your idea.";
  } else if (values.message.trim().length < 10) {
    errors.message = "A little more detail helps — at least 10 characters.";
  }
  return errors;
}

const EMPTY: FormValues = { name: "", email: "", message: "" };

export function ContactPage() {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [touched, setTouched] = useState<Touched>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const errors = useMemo(() => validate(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  const setField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const blurField = (field: keyof FormValues) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const errorFor = (field: keyof FormValues) =>
    touched[field] ? errors[field] : undefined;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (!isValid || status !== "idle") return;
    setStatus("sending");
    // Simulated submission — no real backend.
    window.setTimeout(() => setStatus("sent"), 900);
  };

  const reset = () => {
    setValues(EMPTY);
    setTouched({});
    setStatus("idle");
  };

  return (
    <main className="page-contact container">
      <div className="contact-grid">
        <div className="contact-intro">
          <h1>Contact</h1>
          <p className="contact-lede">
            Commissions, prints, exhibitions — or a long walk with cameras.
            Write a few lines and I'll reply within two working days.
          </p>
          <dl className="contact-details">
            <div>
              <dt>Email</dt>
              <dd>hello@miralin.photo</dd>
            </div>
            <div>
              <dt>Studio</dt>
              <dd>Chengdu, Sichuan — often on the plateau</dd>
            </div>
            <div>
              <dt>Currently</dt>
              <dd>Booking portrait sittings for winter 2026</dd>
            </div>
          </dl>
        </div>

        {status === "sent" ? (
          <div className="contact-success" role="status">
            <span className="contact-success-mark" aria-hidden="true">✓</span>
            <h2>Message sent</h2>
            <p>
              Thank you, {values.name.trim() || "friend"} — your note is on its
              way. I'll write back to{" "}
              <strong>{values.email.trim() || "your inbox"}</strong> within two
              working days.
            </p>
            <button type="button" className="btn-gold" onClick={reset}>
              Send another message
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className={`field${errorFor("name") ? " field-invalid" : ""}`}>
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                onBlur={() => blurField("name")}
                aria-invalid={Boolean(errorFor("name"))}
                aria-describedby={errorFor("name") ? "contact-name-error" : undefined}
              />
              {errorFor("name") && (
                <p className="field-error" id="contact-name-error" role="alert">
                  {errorFor("name")}
                </p>
              )}
            </div>

            <div className={`field${errorFor("email") ? " field-invalid" : ""}`}>
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => blurField("email")}
                aria-invalid={Boolean(errorFor("email"))}
                aria-describedby={errorFor("email") ? "contact-email-error" : undefined}
              />
              {errorFor("email") && (
                <p className="field-error" id="contact-email-error" role="alert">
                  {errorFor("email")}
                </p>
              )}
            </div>

            <div className={`field${errorFor("message") ? " field-invalid" : ""}`}>
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                value={values.message}
                onChange={(e) => setField("message", e.target.value)}
                onBlur={() => blurField("message")}
                aria-invalid={Boolean(errorFor("message"))}
                aria-describedby={errorFor("message") ? "contact-message-error" : undefined}
              />
              {errorFor("message") && (
                <p className="field-error" id="contact-message-error" role="alert">
                  {errorFor("message")}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-gold contact-submit"
              disabled={!isValid || status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Send"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
