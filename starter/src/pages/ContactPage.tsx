import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface Values {
  name: string;
  email: string;
  message: string;
}

type Field = keyof Values;
type Errors = Partial<Record<Field, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }
  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "Please enter a valid email address, e.g. name@example.com.";
  }
  if (!values.message.trim()) {
    errors.message = "Please write a message.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }
  return errors;
}

const EMPTY: Values = { name: "", email: "", message: "" };

export function ContactPage() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const errors = useMemo(() => validate(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  const setField = (field: Field) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
  };

  const blurField = (field: Field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
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

  const fieldError = (field: Field) =>
    touched[field] ? errors[field] : undefined;

  return (
    <div className="wrap page">
      <div className="contact-grid">
        <header className="contact-intro">
          <p className="eyebrow">Contact</p>
          <h1 className="page-title">Get in touch</h1>
          <p className="page-sub">
            For prints, commissions, exhibitions or collaborations, write a few
            lines below — or email directly at{" "}
            <a className="text-link" href="mailto:hello@suqing.photo">
              hello@suqing.photo
            </a>
            . Replies usually go out within a few days, longer when she is on
            the plateau.
          </p>
        </header>

        {status === "sent" ? (
          <div className="form-success" role="status">
            <svg viewBox="0 0 24 24" width="44" height="44" aria-hidden="true">
              <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M7.5 12.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="form-success__title">Message sent</h2>
            <p className="form-success__text">
              Thank you, {values.name.trim().split(" ")[0] || "friend"} — your
              message is on its way. You’ll hear back at{" "}
              <strong>{values.email.trim()}</strong> within a few days.
            </p>
            <button type="button" className="btn btn--ghost" onClick={reset}>
              Send another message
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={onSubmit} noValidate>
            <div className={`field${fieldError("name") ? " has-error" : ""}`}>
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={setField("name")}
                onBlur={blurField("name")}
                aria-invalid={fieldError("name") ? true : undefined}
                aria-describedby={fieldError("name") ? "contact-name-error" : undefined}
              />
              {fieldError("name") && (
                <p className="field__error" id="contact-name-error" role="alert">
                  {fieldError("name")}
                </p>
              )}
            </div>

            <div className={`field${fieldError("email") ? " has-error" : ""}`}>
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={setField("email")}
                onBlur={blurField("email")}
                aria-invalid={fieldError("email") ? true : undefined}
                aria-describedby={fieldError("email") ? "contact-email-error" : undefined}
              />
              {fieldError("email") && (
                <p className="field__error" id="contact-email-error" role="alert">
                  {fieldError("email")}
                </p>
              )}
            </div>

            <div className={`field${fieldError("message") ? " has-error" : ""}`}>
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={6}
                value={values.message}
                onChange={setField("message")}
                onBlur={blurField("message")}
                aria-invalid={fieldError("message") ? true : undefined}
                aria-describedby={fieldError("message") ? "contact-message-error" : undefined}
              />
              {fieldError("message") && (
                <p className="field__error" id="contact-message-error" role="alert">
                  {fieldError("message")}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn--gold contact-form__submit"
              disabled={!isValid || status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Send"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
