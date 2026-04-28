import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { OrderInsert } from "@/types/db";

/**
 * Contact / order submission handler.
 *
 * Persists the inquiry into the Supabase `orders` table. A Database Webhook
 * on that table fires the `notify-order` Edge Function which sends the email
 * notification via SMTP — see [supabase/functions/notify-order/index.ts].
 *
 * Email delivery is therefore handled entirely by Supabase, not from this
 * server. If you need to swap providers, edit the Edge Function only.
 */

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

function failure(
  stage: "supabase" | "config",
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

  // Honeypot trip: respond as success without persisting to throw off bots.
  if (parsed.data.company && parsed.data.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, service, budget, timeline, message } = parsed.data;

  if (!isSupabaseConfigured()) {
    console.error(
      "[api/contact] Supabase is not configured. Cannot persist or notify.",
    );
    return failure(
      "config",
      "The contact form is not configured yet. Please try again later.",
      500,
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

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
      const lower = (dbError.message ?? "").toLowerCase();
      const hint =
        lower.includes("permission") ||
        lower.includes("rls") ||
        dbError.code === "42501"
          ? `${dbError.message} (hint: ensure SUPABASE_SERVICE_ROLE_KEY is the service_role secret — its JWT payload should contain "role":"service_role" — and that the migration in supabase/migrations/0001_init.sql has been run)`
          : dbError.message;
      return failure(
        "supabase",
        "Could not save your inquiry. Please try again in a moment.",
        500,
        hint,
      );
    }
  } catch (error) {
    console.error("[api/contact] Supabase unexpected error", error);
    return failure(
      "supabase",
      "Could not save your inquiry. Please try again later.",
      500,
      error instanceof Error ? error.message : String(error),
    );
  }

  // Email notification is dispatched asynchronously by the Supabase Database
  // Webhook → notify-order Edge Function. We don't block the response on it.
  return NextResponse.json({ ok: true, savedToDb: true });
}
