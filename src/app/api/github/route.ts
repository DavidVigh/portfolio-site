import { NextResponse } from "next/server";
import { fetchUserProjects } from "@/lib/github";
import { siteContent } from "@/content/site";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { GitHubProject, LanguageBreakdown } from "@/types/content";
import type { GitHubRepoRow } from "@/types/db";

export const revalidate = 600;

type ProjectSource = "supabase" | "live" | "empty";

function rowToProject(row: GitHubRepoRow): GitHubProject {
  return {
    id: row.repo_id,
    name: row.name,
    fullName: row.full_name,
    description: row.description,
    url: row.html_url,
    homepage: row.homepage,
    stars: row.stars,
    forks: row.forks,
    topics: row.topics ?? [],
    primaryLanguage: row.primary_language,
    languages: (row.languages ?? []) as LanguageBreakdown[],
    updatedAt: row.updated_at,
    pushedAt: row.pushed_at,
    archived: row.archived,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username =
    searchParams.get("username")?.trim() ||
    process.env.GITHUB_USERNAME ||
    siteContent.githubUsername;

  // Force the live GitHub path with ?source=live (used by callers that explicitly
  // want to bypass the cached DB copy). Default behavior is DB-first.
  const forceLive = searchParams.get("source") === "live";

  // 1) Primary: read from Supabase, populated by the daily cron job.
  if (!forceLive && isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("github_repos")
        .select(
          "repo_id, name, full_name, description, html_url, homepage, stars, forks, topics, primary_language, languages, archived, pushed_at, updated_at, last_synced_at",
        )
        .order("pushed_at", { ascending: false })
        .limit(24);

      if (error) {
        console.warn(
          "[api/github] Supabase read failed, falling back to live fetch:",
          error.message,
        );
      } else if (data && data.length > 0) {
        const lastSyncedAt = (data as GitHubRepoRow[])
          .map((r) => r.last_synced_at)
          .sort()
          .at(-1);
        return NextResponse.json({
          projects: (data as GitHubRepoRow[]).map(rowToProject),
          source: "supabase" satisfies ProjectSource,
          lastSyncedAt,
        });
      } else {
        console.warn(
          "[api/github] github_repos table is empty — falling back to live fetch.",
        );
      }
    } catch (err) {
      console.warn(
        "[api/github] Supabase exception, falling back to live fetch:",
        err,
      );
    }
  }

  // 2) Fallback: live GitHub fetch. Used for:
  //    - first run before any cron has populated github_repos
  //    - local dev without Supabase configured
  //    - explicit ?source=live override
  if (!username) {
    return NextResponse.json(
      { error: "Missing GitHub username." },
      { status: 400 },
    );
  }

  try {
    const projects = await fetchUserProjects(username, { limit: 12 });
    return NextResponse.json({
      projects,
      source: "live" satisfies ProjectSource,
    });
  } catch (error) {
    console.error("[api/github] live fetch failed", error);
    return NextResponse.json(
      {
        error:
          "Could not load GitHub projects. The API may be rate-limited or the user does not exist.",
      },
      { status: 502 },
    );
  }
}
