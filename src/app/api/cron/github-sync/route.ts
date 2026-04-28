import { NextResponse } from "next/server";
import { runGitHubSync } from "@/lib/github-sync";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
// Cron jobs must always re-execute, never cache.
export const dynamic = "force-dynamic";
// Allow up to 60s for repo + language fetches across many projects.
export const maxDuration = 60;

/**
 * Authenticated cron endpoint hit by Vercel Cron once every 24 hours.
 *
 * Authentication accepts either:
 *  - `Authorization: Bearer <CRON_SECRET>` (manual triggers, external schedulers)
 *  - The Vercel-managed `x-vercel-cron-signature` header (automatic for Vercel Cron
 *    once `CRON_SECRET` is set as an environment variable on Vercel).
 *
 * GET and POST behave identically so it works with both Vercel Cron (GET) and
 * manual invocations (POST or GET).
 */
async function handle(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[api/cron/github-sync] CRON_SECRET is not configured.");
    return NextResponse.json(
      { error: "Cron is not configured." },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const vercelCron = request.headers.get("x-vercel-cron");

  const authorized = authHeader === expected || Boolean(vercelCron);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  const result = await runGitHubSync();
  const httpStatus = result.status === "error" ? 500 : 200;
  return NextResponse.json(result, { status: httpStatus });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
