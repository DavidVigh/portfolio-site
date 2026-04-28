import type { GitHubProject, LanguageBreakdown } from "@/types/content";
import { colorForLanguage } from "@/lib/language-colors";

const GITHUB_API = "https://api.github.com";

type RawRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  language: string | null;
  fork: boolean;
  archived: boolean;
  private: boolean;
  updated_at: string;
  pushed_at: string;
  languages_url: string;
};

type FetchOptions = {
  /** Maximum number of non-fork, non-archived repos to return. */
  limit?: number;
  /** Set to true to include forks in results. */
  includeForks?: boolean;
};

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio-site",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function ghFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: buildHeaders(),
    // Cache for 10 minutes server-side. Prevents rate-limit churn on hot reload.
    next: { revalidate: 600 },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `GitHub request failed (${res.status}) for ${url}: ${body.slice(0, 200)}`,
    );
  }
  return res.json() as Promise<T>;
}

function normalizeLanguages(
  raw: Record<string, number>,
): LanguageBreakdown[] {
  const total = Object.values(raw).reduce((sum, n) => sum + n, 0);
  if (total === 0) return [];

  const entries: LanguageBreakdown[] = Object.entries(raw)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: (bytes / total) * 100,
      color: colorForLanguage(name),
    }))
    .sort((a, b) => b.bytes - a.bytes);

  return entries;
}

/**
 * Fetch a normalized list of public repositories with language breakdowns.
 *
 * Sorted by most recently pushed. Forks and archived repos are excluded by default.
 */
export async function fetchUserProjects(
  username: string,
  options: FetchOptions = {},
): Promise<GitHubProject[]> {
  const { limit = 12, includeForks = false } = options;

  const repos = await ghFetch<RawRepo[]>(
    `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed&direction=desc`,
  );

  const filtered = repos.filter((r) => {
    if (r.private) return false;
    if (r.archived) return false;
    if (!includeForks && r.fork) return false;
    return true;
  });

  const limited = filtered.slice(0, limit);

  // Resolve language breakdowns in parallel; tolerate per-repo failures.
  const projects = await Promise.all(
    limited.map(async (repo): Promise<GitHubProject> => {
      let languages: LanguageBreakdown[] = [];
      try {
        const raw = await ghFetch<Record<string, number>>(repo.languages_url);
        languages = normalizeLanguages(raw);
      } catch {
        languages = repo.language
          ? [
              {
                name: repo.language,
                bytes: 1,
                percent: 100,
                color: colorForLanguage(repo.language),
              },
            ]
          : [];
      }

      return {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        homepage: repo.homepage,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        topics: repo.topics ?? [],
        primaryLanguage: repo.language,
        languages,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        archived: repo.archived,
      };
    }),
  );

  return projects;
}
