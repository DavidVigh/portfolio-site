import { fetchUserProjects } from "@/lib/github";
import { getSupabaseAdmin } from "@/lib/supabase";
import type {
  GitHubRepoInsert,
  GitHubSyncRunInsert,
  SyncRunStatus,
} from "@/types/db";
import { siteContent } from "@/content/site";

export type SyncResult = {
  status: SyncRunStatus;
  reposSeen: number;
  insertedCount: number;
  updatedCount: number;
  startedAt: string;
  finishedAt: string;
  error?: string;
};

/**
 * Pull every public, non-fork, non-archived repo for the configured user
 * and upsert into `github_repos`. The sync is idempotent and safe to run
 * on any cadence (currently driven by a 24h Vercel cron job).
 */
export async function runGitHubSync(): Promise<SyncResult> {
  const startedAt = new Date().toISOString();
  const supabase = getSupabaseAdmin();

  const username =
    process.env.GITHUB_USERNAME?.trim() || siteContent.githubUsername;

  if (!username) {
    const finishedAt = new Date().toISOString();
    const error = "Missing GITHUB_USERNAME and no fallback in site content.";
    await logRun(supabase, {
      started_at: startedAt,
      finished_at: finishedAt,
      status: "error",
      repos_seen: 0,
      inserted_count: 0,
      updated_count: 0,
      error,
    });
    return {
      status: "error",
      reposSeen: 0,
      insertedCount: 0,
      updatedCount: 0,
      startedAt,
      finishedAt,
      error,
    };
  }

  let reposSeen = 0;
  let insertedCount = 0;
  let updatedCount = 0;
  let runError: string | undefined;
  let runStatus: SyncRunStatus = "success";

  try {
    // Pull a generous window so the sync also picks up older repos.
    const projects = await fetchUserProjects(username, { limit: 100 });
    reposSeen = projects.length;

    if (reposSeen === 0) {
      const finishedAt = new Date().toISOString();
      await logRun(supabase, {
        started_at: startedAt,
        finished_at: finishedAt,
        status: "success",
        repos_seen: 0,
        inserted_count: 0,
        updated_count: 0,
      });
      return {
        status: "success",
        reposSeen: 0,
        insertedCount: 0,
        updatedCount: 0,
        startedAt,
        finishedAt,
      };
    }

    // Determine which repo_ids already exist so we can report inserts vs updates.
    const repoIds = projects.map((p) => p.id);
    const { data: existingRows, error: existingErr } = await supabase
      .from("github_repos")
      .select("repo_id")
      .in("repo_id", repoIds);

    if (existingErr) {
      throw new Error(`Lookup failed: ${existingErr.message}`);
    }

    const existing = new Set(
      (existingRows ?? []).map(
        (row: { repo_id: number }) => row.repo_id,
      ) as number[],
    );

    const nowIso = new Date().toISOString();
    const rows: GitHubRepoInsert[] = projects.map((p) => ({
      repo_id: p.id,
      name: p.name,
      full_name: p.fullName,
      description: p.description,
      html_url: p.url,
      homepage: p.homepage,
      stars: p.stars,
      forks: p.forks,
      topics: p.topics,
      primary_language: p.primaryLanguage,
      languages: p.languages,
      archived: p.archived,
      pushed_at: p.pushedAt,
      updated_at: p.updatedAt,
      last_synced_at: nowIso,
    }));

    const { error: upsertErr } = await supabase
      .from("github_repos")
      .upsert(rows, { onConflict: "repo_id" });

    if (upsertErr) {
      throw new Error(`Upsert failed: ${upsertErr.message}`);
    }

    insertedCount = rows.filter((r) => !existing.has(r.repo_id)).length;
    updatedCount = rows.length - insertedCount;
  } catch (err) {
    runStatus = "error";
    runError = err instanceof Error ? err.message : String(err);
    console.error("[github-sync] failed", err);
  }

  const finishedAt = new Date().toISOString();
  await logRun(supabase, {
    started_at: startedAt,
    finished_at: finishedAt,
    status: runStatus,
    repos_seen: reposSeen,
    inserted_count: insertedCount,
    updated_count: updatedCount,
    error: runError ?? null,
  });

  return {
    status: runStatus,
    reposSeen,
    insertedCount,
    updatedCount,
    startedAt,
    finishedAt,
    error: runError,
  };
}

async function logRun(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  payload: GitHubSyncRunInsert,
): Promise<void> {
  const { error } = await supabase.from("github_sync_runs").insert(payload);
  if (error) {
    console.warn("[github-sync] could not write audit row", error);
  }
}
