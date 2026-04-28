# Portfolio Site

A personal portfolio + ordering website built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4. Uses the **Fiery Ocean** color palette.

## Features

- **Sticky navbar** with smooth-scroll anchors, scroll-spy active state, and mobile menu
- **Hero / introduction** section with availability indicator
- **Works** section that pulls live data from the **GitHub API** with per-project language percentage bars (GitHub-style)
- **Education & achievements** horizontal scrollable timeline
- **Contact / order** form that persists each submission into Supabase (`orders` table); a Database Webhook fires a Supabase Edge Function that sends two SMTP emails: one admin notification and one user confirmation ("Your order has been placed")
- **Daily GitHub sync** powered by Vercel Cron — every 24h new repos are fetched and upserted into Supabase (`github_repos`)
- Sync audit log in `github_sync_runs` for visibility into each cron execution
- CMS-ready content layer (`src/content/*` with typed contracts in `src/types/content.ts`)

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first theme tokens via `@theme`)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) for orders + repo persistence, plus a Database Webhook → Edge Function that sends contact emails via SMTP
- [denomailer](https://deno.land/x/denomailer) inside the Edge Function for SMTP delivery
- [Vercel Cron](https://vercel.com/docs/cron-jobs) for the 24h GitHub sync
- [Zod](https://zod.dev/) for input validation

## Getting started

```bash
npm install
cp .env.example .env.local
# Fill in GITHUB_USERNAME, the Supabase keys, and CRON_SECRET (see .env.example)
npm run dev
```

Open <http://localhost:3000>.

For the contact-form email notifications to actually deliver, you also need to deploy the Supabase Edge Function and create the Database Webhook — see [Email setup](#email-setup-supabase-edge-function--smtp).

## Environment variables

See [.env.example](./.env.example) for the full list. Quick reference:

| Variable                        | Required | Purpose                                                              |
| ------------------------------- | -------- | -------------------------------------------------------------------- |
| `GITHUB_USERNAME`               | Yes      | Username used by the Works section + the daily sync                  |
| `GITHUB_TOKEN`                  | No       | Raises GitHub API rate limits to 5k/hr                               |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL                                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anon (publishable) key                                      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | Service role key used server-side only by API routes                 |
| `CRON_SECRET`                   | Yes      | Bearer token required to call `/api/cron/github-sync`                |

The Next.js app never touches SMTP. SMTP credentials are stored as **Supabase Edge Function secrets**, not in `.env.local` — see [Email setup](#email-setup-supabase-edge-function--smtp).

## Project structure

```
src/
  app/
    api/
      github/route.ts            # Normalized GitHub projects endpoint (DB-first)
      contact/route.ts           # Validates + persists in Supabase (no SMTP here)
      cron/github-sync/route.ts  # Auth-gated cron endpoint, hit by Vercel Cron
    globals.css                  # Fiery Ocean palette + utilities (Tailwind v4)
    layout.tsx
    page.tsx
  components/
    layout/Navbar.tsx
    layout/Footer.tsx
    sections/Hero.tsx
    sections/Works.tsx
    sections/Timeline.tsx
    sections/ContactOrder.tsx
    ui/Icon.tsx
    ui/LanguageBar.tsx
  content/
    site.ts               # Personal info, socials, GitHub username
    timeline.ts           # Education + achievements entries
    contact.ts            # Contact form copy + service/budget options
  lib/
    cn.ts                 # Class merging helper (clsx + tailwind-merge)
    github.ts             # GitHub API + language breakdown logic
    github-sync.ts        # Daily upsert into github_repos + audit log
    language-colors.ts    # GitHub Linguist color map
    supabase.ts           # Server-only Supabase admin client
  types/
    content.ts            # Stable type contracts (CMS-ready)
    db.ts                 # Supabase row + insert types
supabase/
  config.toml                              # Local CLI config for Edge Functions
  migrations/0001_init.sql                 # Schema: orders, github_repos, github_sync_runs
  functions/notify-order/index.ts          # Edge Function that sends contact emails via SMTP
  functions/notify-order/deno.json         # Function-level Deno imports/config
vercel.json                                # Vercel Cron schedule for the daily sync
```

## Editing your content

- Personal info, socials, and GitHub username: [`src/content/site.ts`](src/content/site.ts)
- Education and achievements timeline: [`src/content/timeline.ts`](src/content/timeline.ts)
- Contact form copy and option lists: [`src/content/contact.ts`](src/content/contact.ts)

The components consume content through `@/content/*` modules only. To migrate to a CMS later, implement a loader returning the same `SiteContent`, `TimelineEntry[]`, and `ContactContent` shapes from `src/types/content.ts`.

## Color palette (Fiery Ocean)

Configured as Tailwind v4 theme tokens in [`src/app/globals.css`](src/app/globals.css):

- `molten-lava` — deep red emphasis
- `brick-red` — primary accent / CTA
- `papaya-whip` — warm light text + secondary accent
- `deep-space-blue` — page and surface backgrounds
- `steel-blue` — borders, muted text, secondary surfaces

## Scripts

```bash
npm run dev     # local dev
npm run build   # production build
npm run start   # production server
npm run lint    # ESLint
```

## Database setup (Supabase)

1. Create a new project at <https://supabase.com>.
2. In the Supabase **SQL Editor**, paste and run the contents of [supabase/migrations/0001_init.sql](./supabase/migrations/0001_init.sql). This creates `orders`, `github_repos`, and `github_sync_runs` with sane indexes and locks down RLS so only the service role can read/write.
3. Go to **Settings → API** and copy:
   - Project URL into `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key into `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to client)

## Email setup (Supabase Edge Function + SMTP)

Email notifications for the contact form are dispatched from a Supabase Edge Function (`supabase/functions/notify-order`) that's automatically called whenever a new row is inserted into `orders` via a Supabase Database Webhook. The function sends both:

- an admin notification to `CONTACT_TO_EMAIL`
- a user confirmation to the submitted `order.email` with "Your order has been placed" and a summary of submitted details

The Next.js app no longer talks to any email provider — its only job is the DB insert.

### One-time setup

1. **Install the Supabase CLI** if you haven't already: <https://supabase.com/docs/guides/local-development/cli/getting-started>.
2. **Link the project** (run inside `portfolio-site/`):

   ```bash
   supabase login
   supabase link --project-ref <YOUR_PROJECT_REF>
   ```

   Your project ref is in the Supabase URL (e.g. `whruexeiagkkxuspovlq` from `https://whruexeiagkkxuspovlq.supabase.co`).

3. **Set the Edge Function secrets.** These are NOT in `.env.local` — they live in Supabase. Reuse the SMTP credentials you already saved in **Authentication → Emails → SMTP Settings**:

   ```bash
   supabase secrets set \
     SMTP_HOST="smtp.your-provider.com" \
     SMTP_PORT="587" \
     SMTP_USER="your-smtp-user" \
     SMTP_PASS="your-smtp-password" \
     SMTP_FROM='"Portfolio" <noreply@your-domain.com>' \
     CONTACT_TO_EMAIL="your-inbox@example.com" \
     WEBHOOK_SECRET="$(openssl rand -hex 32)"
   ```

   Save the `WEBHOOK_SECRET` value — you'll paste it into the Database Webhook config in step 5.

4. **Deploy the Edge Function:**

   ```bash
   supabase functions deploy notify-order --no-verify-jwt
   ```

   `--no-verify-jwt` is required because Database Webhook calls don't carry a Supabase JWT; the function authenticates them itself via `WEBHOOK_SECRET`.

5. **Create the Database Webhook in the Supabase dashboard:**

   - Go to **Database → Webhooks → Create a new hook**.
   - Name: `notify-order`
   - Table: `public.orders`
   - Events: `Insert` only
   - Type: **Supabase Edge Function**
   - Edge Function: `notify-order`
   - HTTP Headers: add `Authorization: Bearer <WEBHOOK_SECRET>` (the same secret you set in step 3)
   - Save.

6. **Test it.** Submit the contact form on the live site (or insert a test row into `orders` from the SQL Editor). You should receive the email within a couple of seconds. Logs are visible in **Edge Functions → notify-order → Logs**.

### Local dev for the Edge Function

If you want to iterate on the function locally:

```bash
supabase functions serve notify-order --no-verify-jwt --env-file ./supabase/functions/notify-order/.env
```

Create that `.env` with the same `SMTP_*` and `WEBHOOK_SECRET` values. Then POST a sample webhook payload to `http://localhost:54321/functions/v1/notify-order` to test send.

### Switching SMTP providers later

Edit `supabase/functions/notify-order/index.ts` if needed (most providers just work with the standard SMTP env vars), update the `SMTP_*` secrets via `supabase secrets set`, and redeploy:

```bash
supabase functions deploy notify-order --no-verify-jwt
```

No changes to the Next.js app are required.

## GitHub sync cron

A daily Vercel Cron job hits `POST /api/cron/github-sync` and calls `runGitHubSync()` in [src/lib/github-sync.ts](./src/lib/github-sync.ts), which reconciles `github_repos` against the GitHub API in three passes:

1. Fetches the configured user's public, non-fork, non-archived repos.
2. Upserts every repo into `github_repos` keyed by the GitHub `repo_id` (inserts new, updates existing).
3. **Prunes** rows whose `repo_id` is no longer in the GitHub response — catches repos that were deleted, set to private, archived, transferred to another owner, or converted to forks since the last run.
4. Logs a row in `github_sync_runs` with `inserted_count`, `updated_count`, `deleted_count`, and any error.

If the GitHub API returns an empty list (transient outage), the prune step is skipped to avoid wiping the table.

> If you've already run `0001_init.sql` in production, also run [supabase/migrations/0002_add_deleted_count.sql](./supabase/migrations/0002_add_deleted_count.sql) to add the new `deleted_count` column to `github_sync_runs`.

Schedule lives in [vercel.json](./vercel.json) (default `0 2 * * *`, i.e. 02:00 UTC daily). Authenticated via `CRON_SECRET`. To trigger manually:

```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://<your-domain>/api/cron/github-sync
```

## Deployment

Deploy to [Vercel](https://vercel.com) with one click. Add all environment variables from `.env.example`. Vercel automatically registers the cron from `vercel.json` once the project is deployed; check **Project → Cron Jobs** to confirm it's listed and view past runs.

The Supabase Edge Function and Database Webhook (see [Email setup](#email-setup-supabase-edge-function--smtp)) are independent of Vercel — they live in your Supabase project and run automatically as soon as a new row hits `orders`.
