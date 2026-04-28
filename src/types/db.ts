/**
 * Supabase row contracts.
 *
 * These types describe the persisted shape of each table. Insert types omit
 * server-generated columns (id / created_at / etc.) so callers don't need to
 * supply them.
 */

export type OrderStatus =
  | "new"
  | "in_review"
  | "accepted"
  | "rejected"
  | "completed";

export type OrderRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  service: string | null;
  budget: string | null;
  timeline: string | null;
  message: string;
  status: OrderStatus;
  source: string | null;
};

export type OrderInsert = {
  name: string;
  email: string;
  service?: string | null;
  budget?: string | null;
  timeline?: string | null;
  message: string;
  status?: OrderStatus;
  source?: string | null;
};

export type GitHubRepoRow = {
  id: string;
  repo_id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stars: number;
  forks: number;
  topics: string[];
  primary_language: string | null;
  languages: { name: string; bytes: number; percent: number; color: string }[];
  archived: boolean;
  pushed_at: string;
  updated_at: string;
  last_synced_at: string;
};

export type GitHubRepoInsert = Omit<GitHubRepoRow, "id" | "last_synced_at"> & {
  last_synced_at?: string;
};

export type SyncRunStatus = "success" | "partial" | "error";

export type GitHubSyncRunRow = {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: SyncRunStatus;
  repos_seen: number;
  inserted_count: number;
  updated_count: number;
  error: string | null;
};

export type GitHubSyncRunInsert = {
  started_at?: string;
  finished_at?: string | null;
  status: SyncRunStatus;
  repos_seen: number;
  inserted_count: number;
  updated_count: number;
  error?: string | null;
};
