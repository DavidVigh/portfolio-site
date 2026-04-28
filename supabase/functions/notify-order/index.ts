/**
 * Supabase Edge Function: notify-order
 *
 * Triggered by a Database Webhook on `public.orders` (INSERT events) and
 * sends a notification email via SMTP using the credentials you already
 * configured in the Supabase dashboard.
 *
 * Environment / secrets (set via `supabase secrets set` or the dashboard
 * "Edge Functions → Secrets" tab):
 *
 *   SMTP_HOST          e.g. smtp.gmail.com / smtp-relay.brevo.com
 *   SMTP_PORT          e.g. 587 (STARTTLS) or 465 (TLS)
 *   SMTP_USER          SMTP username
 *   SMTP_PASS          SMTP password / API key / app password
 *   SMTP_FROM          From address, e.g. "Portfolio <noreply@example.com>"
 *   CONTACT_TO_EMAIL   Inbox where contact form submissions are delivered
 *   WEBHOOK_SECRET     Long random string. Configure the same value as the
 *                      `Authorization: Bearer <WEBHOOK_SECRET>` header on
 *                      the Database Webhook. Protects this endpoint from
 *                      abuse since the function URL is public.
 */

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

interface OrderRecord {
  id: string;
  created_at: string;
  name: string;
  email: string;
  service: string | null;
  budget: string | null;
  timeline: string | null;
  message: string;
  status: string;
  source: string | null;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: OrderRecord | null;
  old_record: OrderRecord | null;
}

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function buildSummaryLines(order: OrderRecord): string[] {
  const summaryLines: string[] = [];
  summaryLines.push(`Name: ${order.name}`);
  summaryLines.push(`Email: ${order.email}`);
  if (order.service) summaryLines.push(`Service: ${order.service}`);
  if (order.budget) summaryLines.push(`Budget: ${order.budget}`);
  if (order.timeline) summaryLines.push(`Timeline: ${order.timeline}`);
  if (order.source) summaryLines.push(`Source: ${order.source}`);
  summaryLines.push(`Order ID: ${order.id}`);
  return summaryLines;
}

function buildAdminEmail(order: OrderRecord): EmailPayload {
  const summaryLines = buildSummaryLines(order);
  return {
    to: Deno.env.get("CONTACT_TO_EMAIL") ?? "",
    subject: `New website inquiry from ${order.name}`,
    text: `${summaryLines.join("\n")}\n\nMessage:\n${order.message}`,
    html: `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; line-height:1.5; color:#0b1319;">
        <h2 style="margin:0 0 12px 0;">New website inquiry</h2>
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
          <tr><td><strong>Name</strong></td><td>${escapeHtml(order.name)}</td></tr>
          <tr><td><strong>Email</strong></td><td>${escapeHtml(order.email)}</td></tr>
          ${order.service ? `<tr><td><strong>Service</strong></td><td>${escapeHtml(order.service)}</td></tr>` : ""}
          ${order.budget ? `<tr><td><strong>Budget</strong></td><td>${escapeHtml(order.budget)}</td></tr>` : ""}
          ${order.timeline ? `<tr><td><strong>Timeline</strong></td><td>${escapeHtml(order.timeline)}</td></tr>` : ""}
          <tr><td><strong>Order ID</strong></td><td><code>${escapeHtml(order.id)}</code></td></tr>
        </table>
        <h3 style="margin:20px 0 6px 0;">Message</h3>
        <p style="white-space:pre-wrap;">${escapeHtml(order.message)}</p>
      </div>
    `,
    replyTo: order.email,
  };
}

function buildUserConfirmationEmail(order: OrderRecord): EmailPayload {
  const summaryLines: string[] = [];
  summaryLines.push("Your order has been placed.");
  summaryLines.push("");
  summaryLines.push(`Name: ${order.name}`);
  if (order.service) summaryLines.push(`Service: ${order.service}`);
  if (order.budget) summaryLines.push(`Budget: ${order.budget}`);
  if (order.timeline) summaryLines.push(`Timeline: ${order.timeline}`);
  summaryLines.push(`Order ID: ${order.id}`);
  summaryLines.push("");
  summaryLines.push("Message:");
  summaryLines.push(order.message);

  return {
    to: order.email,
    subject: "Your order has been placed",
    text: summaryLines.join("\n"),
    html: `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; line-height:1.5; color:#0b1319;">
        <h2 style="margin:0 0 12px 0;">Your order has been placed</h2>
        <p>Hi ${escapeHtml(order.name)},</p>
        <p>Thanks for reaching out. I received your request successfully.</p>
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
          ${order.service ? `<tr><td><strong>Service</strong></td><td>${escapeHtml(order.service)}</td></tr>` : ""}
          ${order.budget ? `<tr><td><strong>Budget</strong></td><td>${escapeHtml(order.budget)}</td></tr>` : ""}
          ${order.timeline ? `<tr><td><strong>Timeline</strong></td><td>${escapeHtml(order.timeline)}</td></tr>` : ""}
          <tr><td><strong>Order ID</strong></td><td><code>${escapeHtml(order.id)}</code></td></tr>
        </table>
        <h3 style="margin:20px 0 6px 0;">Your message</h3>
        <p style="white-space:pre-wrap;">${escapeHtml(order.message)}</p>
      </div>
    `,
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // ---------------------------------------------------------------------------
  // Auth: verify the webhook secret. Supabase Database Webhooks let you set
  // arbitrary headers per webhook, so we add `Authorization: Bearer <SECRET>`
  // there and verify it here.
  // ---------------------------------------------------------------------------
  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("[notify-order] WEBHOOK_SECRET is not configured.");
    return jsonResponse({ error: "Function not configured." }, 500);
  }

  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader !== `Bearer ${webhookSecret}`) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  // ---------------------------------------------------------------------------
  // Parse + filter payload. We only care about INSERT events on `orders`.
  // ---------------------------------------------------------------------------
  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  if (
    payload.type !== "INSERT" ||
    payload.table !== "orders" ||
    !payload.record
  ) {
    return jsonResponse({ ok: true, ignored: true });
  }

  const order = payload.record;

  // ---------------------------------------------------------------------------
  // SMTP send
  // ---------------------------------------------------------------------------
  const host = Deno.env.get("SMTP_HOST");
  const portRaw = Deno.env.get("SMTP_PORT");
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASS");
  const from = Deno.env.get("SMTP_FROM");
  const to = Deno.env.get("CONTACT_TO_EMAIL");

  if (!host || !portRaw || !user || !pass || !from || !to) {
    console.error(
      "[notify-order] Missing SMTP configuration. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, CONTACT_TO_EMAIL.",
    );
    return jsonResponse({ error: "SMTP not configured." }, 500);
  }

  const port = Number(portRaw);
  if (Number.isNaN(port)) {
    return jsonResponse({ error: "SMTP_PORT must be a number." }, 500);
  }

  const adminEmail = buildAdminEmail(order);
  const userEmail = buildUserConfirmationEmail(order);

  const client = new SMTPClient({
    connection: {
      hostname: host,
      port,
      // Implicit TLS on 465, STARTTLS on 587/2525.
      tls: port === 465,
      auth: {
        username: user,
        password: pass,
      },
    },
  });

  try {
    await client.send({
      from,
      to: adminEmail.to,
      replyTo: adminEmail.replyTo,
      subject: adminEmail.subject,
      content: adminEmail.text,
      html: adminEmail.html,
    });
  } catch (error) {
    console.error("[notify-order] SMTP send failed (stage=admin)", error);
    try {
      await client.close();
    } catch {
      // ignore close errors after a send failure
    }
    return jsonResponse(
      {
        error: "SMTP send failed.",
        stage: "admin",
        message: error instanceof Error ? error.message : String(error),
      },
      502,
    );
  }

  try {
    await client.send({
      from,
      to: userEmail.to,
      subject: userEmail.subject,
      content: userEmail.text,
      html: userEmail.html,
    });
  } catch (error) {
    console.error("[notify-order] SMTP send failed (stage=user)", error);
    try {
      await client.close();
    } catch {
      // ignore close errors after a send failure
    }
    return jsonResponse(
      {
        error: "SMTP send failed.",
        stage: "user",
        message: error instanceof Error ? error.message : String(error),
      },
      502,
    );
  }

  await client.close();
  return jsonResponse({ ok: true, orderId: order.id });
});
