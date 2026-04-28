import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 *
 * Uses the service role key so server-only routes can write to the database
 * without depending on RLS-friendly auth. NEVER import this from client
 * components — the service role key must stay on the server.
 */
let cachedClient: SupabaseClient | null = null;
let warnedAboutKey = false;

/**
 * Best-effort sanity check: if SUPABASE_SERVICE_ROLE_KEY is a JWT, decode the
 * payload and warn loudly when its `role` claim isn't `service_role`. Silent
 * RLS denials are the most common Supabase setup bug, and this surfaces the
 * cause in the server logs immediately.
 *
 * Skips opaque key formats (e.g. `sb_secret_*` from the new API keys page),
 * which can't be inspected client-side and don't have a role claim to verify.
 */
function warnIfMisconfiguredKey(key: string): void {
  if (warnedAboutKey) return;
  const parts = key.split(".");
  if (parts.length !== 3) return;
  try {
    const padded = parts[1] + "=".repeat((4 - (parts[1].length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    const payload = JSON.parse(json) as { role?: string };
    if (payload.role && payload.role !== "service_role") {
      warnedAboutKey = true;
      console.warn(
        `[supabase] SUPABASE_SERVICE_ROLE_KEY appears to be the "${payload.role}" key, not the service_role key. ` +
          `RLS will block all writes (orders insert, github_repos upsert). ` +
          `Fix it in .env.local: copy the service_role secret from Supabase → Settings → API → Project API keys, ` +
          `then restart \`npm run dev\`.`,
      );
    }
  } catch {
    // Ignore decode errors — assume the key is intentionally an opaque format.
  }
}

export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.",
    );
  }

  warnIfMisconfiguredKey(serviceRoleKey);

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: { "x-application-name": "portfolio-site" },
    },
  });

  return cachedClient;
}

/**
 * Returns true when both URL + service role env vars are present so callers
 * can soft-degrade (e.g. skip persistence in local dev without Supabase set up).
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
