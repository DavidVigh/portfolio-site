/**
 * Content type contracts.
 *
 * These types describe the shape of editable site content. They are intentionally
 * detached from any rendering concern so that the source of truth can later move
 * from local TypeScript modules to a CMS (Sanity, Contentful, Payload, etc.) by
 * implementing a loader that resolves to the same shapes.
 */

export type SocialLink = {
  label: string;
  href: string;
  /** Short identifier used to pick an icon. */
  icon: "github" | "linkedin" | "x" | "email" | "globe";
};

export type SiteContent = {
  name: string;
  role: string;
  tagline: string;
  intro: string;
  location?: string;
  /** GitHub username used by the projects section to fetch repos. */
  githubUsername: string;
  socials: SocialLink[];
  resumeUrl?: string;
};

export type TimelineKind = "education" | "achievement" | "experience";

export type TimelineEntry = {
  id: string;
  kind: TimelineKind;
  title: string;
  subtitle?: string;
  /** Display string, e.g. "2024" or "2022 — 2023". */
  period: string;
  /** Sortable ISO-ish date for chronological ordering. */
  startDate: string;
  description: string;
  highlights?: string[];
  location?: string;
};

export type ServiceOption = {
  id: string;
  label: string;
  description?: string;
};

export type BudgetOption = {
  id: string;
  label: string;
};

export type ContactContent = {
  heading: string;
  subheading: string;
  /** Helper line shown above the form, e.g. response time guarantee. */
  responseNote: string;
  services: ServiceOption[];
  budgets: BudgetOption[];
};

/**
 * "Then -> Now" snapshot. A pair of these powers the BeforeAfter section,
 * showing the contrast between a starting point and the present.
 */
export type GrowthSnapshot = {
  /** Headline label for the card, e.g. "Right after high school". */
  label: string;
  /** Time period this snapshot represents, e.g. "Mid 2025". */
  period: string;
  /** One-line summary shown under the label. */
  headline: string;
  /** Skills the person had at this stage, rendered as chips. */
  skills: string[];
  /** Notable highlights / achievements at this stage. */
  highlights: string[];
};

export type GrowthContent = {
  before: GrowthSnapshot;
  after: GrowthSnapshot;
};

/**
 * GitHub project data after normalization in [src/lib/github.ts].
 * Keep this stable so the API route and UI don't need to track GitHub schema changes.
 */
export type LanguageBreakdown = {
  name: string;
  bytes: number;
  percent: number;
  /** Hex color used for the GitHub-like progress bar. */
  color: string;
};

export type GitHubProject = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  forks: number;
  topics: string[];
  primaryLanguage: string | null;
  languages: LanguageBreakdown[];
  updatedAt: string;
  pushedAt: string;
  archived: boolean;
};
