# Portfolio Site

A personal portfolio + ordering website built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4. Uses the **Fiery Ocean** color palette.

## Features

- **Sticky navbar** with smooth-scroll anchors, scroll-spy active state, and mobile menu
- **Hero / introduction** section with availability indicator
- **Works** section that pulls live data from the **GitHub API** with per-project language percentage bars (GitHub-style)
- **Education & achievements** horizontal scrollable timeline
- **Contact / order** form that sends an email notification via **Resend** _and_ persists each submission into Supabase (`orders` table)
- **Daily GitHub sync** powered by Vercel Cron — every 24h new repos are fetched and upserted into Supabase (`github_repos`)
- Sync audit log in `github_sync_runs` for visibility into each cron execution
- CMS-ready content layer (`src/content/*` with typed contracts in `src/types/content.ts`)

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first theme tokens via `@theme`)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) for orders + repo persistence
- [Resend](https://resend.com/) for transactional email
- [Vercel Cron](https://vercel.com/docs/cron-jobs) for the 24h GitHub sync
- [Zod](https://zod.dev/) for input validation

## Getting started

```bash
npm install
cp .env.example .env.local
# Fill in GITHUB_USERNAME, RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

See [.env.example](./.env.example) for the full list. Quick reference:

| Variable                        | Required | Purpose                                                              |
| ------------------------------- | -------- | -------------------------------------------------------------------- |
| `GITHUB_USERNAME`               | Yes      | Username used by the Works section + the daily sync                  |
| `GITHUB_TOKEN`                  | No       | Raises GitHub API rate limits to 5k/hr                               |
| `RESEND_API_KEY`                | Yes      | Enables the contact form to send email notifications                 |
| `CONTACT_TO_EMAIL`              | Yes      | Where contact form submissions are delivered                         |
| `CONTACT_FROM_EMAIL`            | Yes      | Verified sender address used by Resend                               |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL                                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anon (publishable) key                                      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | Service role key used server-side only by API routes                 |
| `CRON_SECRET`                   | Yes      | Bearer token required to call `/api/cron/github-sync`                |

If the Resend env vars are missing, the contact form returns a clear server error instead of failing silently. If Supabase isn't configured at all, the contact route soft-skips persistence and only sends the email — useful for local dev without a Supabase project.

## Project structure

```
src/
  app/
    api/
      github/route.ts            # Normalized GitHub projects endpoint
      contact/route.ts           # Validates, persists in Supabase, sends email
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
  migrations/0001_init.sql  # Schema: orders, github_repos, github_sync_runs
vercel.json                 # Vercel Cron schedule for the daily sync
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

## GitHub sync cron

A daily Vercel Cron job hits `POST /api/cron/github-sync` and calls `runGitHubSync()` in [src/lib/github-sync.ts](./src/lib/github-sync.ts), which:

1. Fetches the configured user's public, non-fork, non-archived repos.
2. Upserts every repo into `github_repos` keyed by the GitHub `repo_id`.
3. Logs a row in `github_sync_runs` with counts and any error.

Schedule lives in [vercel.json](./vercel.json) (default `0 2 * * *`, i.e. 02:00 UTC daily). Authenticated via `CRON_SECRET`. To trigger manually:

```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://<your-domain>/api/cron/github-sync
```

## Deployment

Deploy to [Vercel](https://vercel.com) with one click. Add all environment variables from `.env.example`. Vercel automatically registers the cron from `vercel.json` once the project is deployed; check **Project → Cron Jobs** to confirm it's listed and view past runs.
