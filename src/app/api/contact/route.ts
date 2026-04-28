import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { OrderInsert } from "@/types/db";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().email("A valid email is required.").max(200),
  service: z.string().trim().max(60).optional(),
  budget: z.string().trim().max(60).optional(),
  timeline: z.string().trim().max(120).optional(),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters.")
    .max(4000),
  /** Honeypot: silently rejected when filled. */
  company: z.string().max(0).optional(),
});

export const runtime = "nodejs";

const isDev = process.env.NODE_ENV !== "production";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function failure(
  stage: "supabase" | "resend" | "config",
  userMessage: string,
  status: number,
  detail?: string,
): NextResponse {
  return NextResponse.json(
    {
      error: userMessage,
      ...(isDev && detail ? { details: { stage, message: detail } } : {}),
    },
    { status },
  );
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Honeypot trip: respond as success without sending to throw off bots.
  if (parsed.data.company && parsed.data.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, service, budget, timeline, message } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  const resendConfigured = Boolean(apiKey && to && from);
  const supabaseConfigured = isSupabaseConfigured();

  if (!resendConfigured && !supabaseConfigured) {
    console.error(
      "[api/contact] Neither Supabase nor Resend is configured. Cannot persist or notify.",
    );
    return failure(
      "config",
      "The contact form is not configured yet. Please try again later.",
      500,
      "Set Supabase env vars and/or RESEND_API_KEY + CONTACT_TO_EMAIL + CONTACT_FROM_EMAIL.",
    );
  }

  // ---------------------------------------------------------------------------
  // Stage 1: persist to Supabase (when configured)
  // ---------------------------------------------------------------------------
  let savedToDb = false;
  if (supabaseConfigured) {
    try {
      const supabase = getSupabaseAdmin();
      const insert: OrderInsert = {
        name,
        email,
        service: service && service.length > 0 ? service : null,
        budget: budget && budget.length > 0 ? budget : null,
        timeline: timeline && timeline.length > 0 ? timeline : null,
        message,
        status: "new",
        source: "portfolio-site/contact",
      };
      const { error: dbError } = await supabase.from("orders").insert(insert);
      if (dbError) {
        console.error("[api/contact] Supabase insert error", dbError);
        const hint =
          dbError.message?.toLowerCase().includes("permission") ||
          dbError.message?.toLowerCase().includes("rls") ||
          dbError.code === "42501"
            ? `${dbError.message} (hint: ensure SUPABASE_SERVICE_ROLE_KEY is the service_role key — its JWT payload should contain "role":"service_role" — and that the migration in supabase/migrations/0001_init.sql has been run)`
            : dbError.message;
        return failure(
          "supabase",
          "Could not save your inquiry. Please try again in a moment.",
          500,
          hint,
        );
      }
      savedToDb = true;
    } catch (error) {
      console.error("[api/contact] Supabase unexpected error", error);
      return failure(
        "supabase",
        "Could not save your inquiry. Please try again later.",
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Stage 2: email notification (when configured)
  // ---------------------------------------------------------------------------
  if (!resendConfigured) {
    if (savedToDb) {
      // The order is safe in the DB — return success even though no email went out.
      console.warn(
        "[api/contact] Resend not configured — skipping email notification.",
      );
      return NextResponse.json({
        ok: true,
        savedToDb,
        emailSent: false,
        warning: "Saved to database, email notification was skipped.",
      });
    }
    return failure(
      "resend",
      "Email service is not configured.",
      500,
      "Set RESEND_API_KEY, CONTACT_TO_EMAIL, and CONTACT_FROM_EMAIL.",
    );
  }

  const resend = new Resend(apiKey!);

  const subject = `New website inquiry from ${name}`;
  const summary = [
    ["Name", name],
    ["Email", email],
    ["Service", service],
    ["Budget", budget],
    ["Timeline", timeline],
  ]
    .filter(([, v]) => v && String(v).length > 0)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const text = `${summary}\n\nMessage:\n${message}`;
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; line-height:1.5; color:#0b1319;">
      <h2 style="margin:0 0 12px 0;">New website inquiry</h2>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
        ${service ? `<tr><td><strong>Service</strong></td><td>${escapeHtml(service)}</td></tr>` : ""}
        ${budget ? `<tr><td><strong>Budget</strong></td><td>${escapeHtml(budget)}</td></tr>` : ""}
        ${timeline ? `<tr><td><strong>Timeline</strong></td><td>${escapeHtml(timeline)}</td></tr>` : ""}
      </table>
      <h3 style="margin:20px 0 6px 0;">Message</h3>
      <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;

  try {
    const { error: sendError } = await resend.emails.send({
      from: from!,
      to: to!,
      replyTo: email,
      subject,
      text,
      html,
    });

    if (sendError) {
      console.error("[api/contact] Resend error", sendError);
      // The lead is safely saved — surface a non-fatal warning to the client.
      if (savedToDb) {
        return NextResponse.json({
          ok: true,
          savedToDb,
          emailSent: false,
          warning: "Saved to database but the email notification failed.",
          ...(isDev
            ? {
                details: {
                  stage: "resend",
                  message: sendError.message ?? "Unknown Resend error",
                },
              }
            : {}),
        });
      }
      return failure(
        "resend",
        "Could not send your message. Please try again later.",
        502,
        sendError.message ?? "Unknown Resend error",
      );
    }
  } catch (error) {
    console.error("[api/contact] Resend unexpected error", error);
    if (savedToDb) {
      return NextResponse.json({
        ok: true,
        savedToDb,
        emailSent: false,
        warning: "Saved to database but the email notification failed.",
        ...(isDev
          ? {
              details: {
                stage: "resend",
                message: error instanceof Error ? error.message : String(error),
              },
            }
          : {}),
      });
    }
    return failure(
      "resend",
      "Unexpected error while sending your message.",
      500,
      error instanceof Error ? error.message : String(error),
    );
  }

  return NextResponse.json({ ok: true, savedToDb, emailSent: true });
}
