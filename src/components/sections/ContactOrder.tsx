"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { contactContent } from "@/content/contact";

type SubmitStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const FIELD_BASE =
  "w-full rounded-lg border border-steel-blue-700 bg-deep-space-blue-900/60 px-4 py-3 text-papaya-whip-50 placeholder:text-steel-blue-400 focus:border-brick-red-500 focus:outline-none focus:ring-2 focus:ring-brick-red-500/40";

export function ContactOrder() {
  const [status, setStatus] = useState<SubmitStatus>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "loading") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      service: String(data.get("service") ?? ""),
      budget: String(data.get("budget") ?? ""),
      timeline: String(data.get("timeline") ?? ""),
      message: String(data.get("message") ?? ""),
      company: String(data.get("company") ?? ""),
    };

    setStatus({ kind: "loading" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const issues = json?.issues
          ? Object.values(json.issues).flat().filter(Boolean).join(" ")
          : null;
        throw new Error(
          issues || json?.error || "Something went wrong. Please try again.",
        );
      }

      setStatus({ kind: "success" });
      form.reset();
    } catch (err) {
      setStatus({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "Could not send your message. Please try again.",
      });
    }
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="py-24 sm:py-32"
    >
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brick-red-400">
              Contact / Order
            </p>
            <h2
              id="contact-heading"
              className="text-3xl font-bold tracking-tight text-papaya-whip-50 sm:text-4xl"
            >
              {contactContent.heading}
            </h2>
            <p className="text-steel-blue-200">{contactContent.subheading}</p>

            <ul className="mt-2 space-y-3 text-sm text-steel-blue-200">
              <li className="flex items-start gap-2">
                <Icon
                  name="check"
                  size={18}
                  className="mt-0.5 text-brick-red-400"
                />
                <span>
                  Tell me what you need — I&apos;ll send a tailored proposal.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  name="check"
                  size={18}
                  className="mt-0.5 text-brick-red-400"
                />
                <span>{contactContent.responseNote}</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  name="check"
                  size={18}
                  className="mt-0.5 text-brick-red-400"
                />
                <span>No spam, ever. Your email is only used to reply.</span>
              </li>
            </ul>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="card-surface flex flex-col gap-5 p-6 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your name" required htmlFor="contact-name">
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={120}
                  className={FIELD_BASE}
                  placeholder="Jane Doe"
                />
              </Field>
              <Field label="Email" required htmlFor="contact-email">
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={200}
                  className={FIELD_BASE}
                  placeholder="jane@example.com"
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Project type" htmlFor="contact-service">
                <select
                  id="contact-service"
                  name="service"
                  defaultValue=""
                  className={FIELD_BASE}
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  {contactContent.services.map((s) => (
                    <option key={s.id} value={s.label}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Budget" htmlFor="contact-budget">
                <select
                  id="contact-budget"
                  name="budget"
                  defaultValue=""
                  className={FIELD_BASE}
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  {contactContent.budgets.map((b) => (
                    <option key={b.id} value={b.label}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Desired timeline" htmlFor="contact-timeline">
              <input
                id="contact-timeline"
                name="timeline"
                type="text"
                maxLength={120}
                className={FIELD_BASE}
                placeholder="e.g. ASAP, next month, Q3 2026"
              />
            </Field>

            <Field
              label="Tell me about your project"
              required
              htmlFor="contact-message"
            >
              <textarea
                id="contact-message"
                name="message"
                rows={6}
                required
                minLength={10}
                maxLength={4000}
                className={cn(FIELD_BASE, "resize-y")}
                placeholder="What are you trying to build, who is it for, and what's the goal?"
              />
            </Field>

            {/* Honeypot: hidden from users, must remain empty. */}
            <div
              aria-hidden
              className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden"
            >
              <label>
                Company (leave empty)
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={status.kind === "loading"}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full bg-brick-red-500 px-6 py-3 text-base font-medium text-papaya-whip-50 shadow-lg shadow-brick-red-900/40 transition-all hover:-translate-y-0.5 hover:bg-brick-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-papaya-whip-400",
                status.kind === "loading" && "cursor-not-allowed opacity-80",
              )}
            >
              {status.kind === "loading" ? (
                <>
                  <Icon
                    name="spinner"
                    size={18}
                    className="animate-spin"
                  />
                  Sending…
                </>
              ) : (
                <>
                  Send message
                  <Icon name="arrow-right" size={18} />
                </>
              )}
            </button>

            {status.kind === "success" ? (
              <p
                role="status"
                className="rounded-lg border border-papaya-whip-400/40 bg-papaya-whip-400/10 px-4 py-3 text-sm text-papaya-whip-100"
              >
                Thanks — your message is on its way. I&apos;ll reply soon.
              </p>
            ) : null}

            {status.kind === "error" ? (
              <p
                role="alert"
                className="rounded-lg border border-brick-red-500/50 bg-brick-red-500/10 px-4 py-3 text-sm text-brick-red-200"
              >
                {status.message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-steel-blue-200"
      >
        {label}
        {required ? (
          <span className="ml-1 text-brick-red-400" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
    </div>
  );
}
