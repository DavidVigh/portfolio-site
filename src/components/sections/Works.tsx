"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { LanguageBar } from "@/components/ui/LanguageBar";
import type { GitHubProject } from "@/types/content";

type FetchState =
  | { status: "loading" }
  | { status: "ready"; projects: GitHubProject[] }
  | { status: "error"; message: string };

function ProjectCard({ project }: { project: GitHubProject }) {
  return (
    <article className="card-surface group flex h-full flex-col gap-4 p-6 transition-colors hover:border-brick-red-500/50">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-papaya-whip-50">
            {project.name}
          </h3>
          <p className="mt-1 text-xs font-mono text-steel-blue-400">
            {project.fullName}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-steel-blue-300">
          <span
            className="inline-flex items-center gap-1"
            title={`${project.stars} stars`}
          >
            <Icon name="star" size={16} />
            {project.stars}
          </span>
          <span
            className="inline-flex items-center gap-1"
            title={`${project.forks} forks`}
          >
            <Icon name="fork" size={16} />
            {project.forks}
          </span>
        </div>
      </header>

      <p className="line-clamp-3 text-sm text-steel-blue-200">
        {project.description ?? (
          <span className="italic text-steel-blue-400">
            No description provided.
          </span>
        )}
      </p>

      {project.topics.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {project.topics.slice(0, 5).map((topic) => (
            <li
              key={topic}
              className="rounded-full border border-steel-blue-700/70 bg-steel-blue-900/60 px-2 py-0.5 text-[11px] text-steel-blue-200"
            >
              #{topic}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto flex flex-col gap-3 pt-2">
        <LanguageBar languages={project.languages} />
        <div className="flex items-center justify-between gap-3">
          <Link
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-papaya-whip-300 transition-colors hover:text-papaya-whip-50"
          >
            Source
            <Icon name="github" size={14} />
          </Link>
          {project.homepage ? (
            <Link
              href={project.homepage}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brick-red-300 transition-colors hover:text-brick-red-200"
            >
              Live
              <Icon name="external" size={14} />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ProjectSkeleton() {
  return (
    <div className="card-surface flex h-full flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-steel-blue-800/70" />
          <div className="h-3 w-40 animate-pulse rounded bg-steel-blue-800/50" />
        </div>
        <div className="h-3 w-16 animate-pulse rounded bg-steel-blue-800/40" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-steel-blue-800/50" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-steel-blue-800/40" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-steel-blue-800/30" />
      </div>
      <div className="mt-auto h-2 w-full animate-pulse rounded-full bg-steel-blue-800/60" />
    </div>
  );
}

export function Works() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch("/api/github", {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error ?? "Failed to load projects.");
        }
        setState({
          status: "ready",
          projects: data.projects as GitHubProject[],
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message:
            err instanceof Error
              ? err.message
              : "Could not load projects right now.",
        });
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return (
    <section
      id="works"
      aria-labelledby="works-heading"
      className="py-24 sm:py-32"
    >
      <div className="section-shell">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brick-red-400">
              Selected works
            </p>
            <h2
              id="works-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-papaya-whip-50 sm:text-4xl"
            >
              Live from my GitHub
            </h2>
            <p className="mt-3 max-w-2xl text-steel-blue-200">
              Projects are fetched directly from GitHub. Each card shows a
              language usage breakdown — same as you&apos;d see on the repo page.
            </p>
          </div>
        </header>

        {state.status === "loading" ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectSkeleton key={i} />
            ))}
          </div>
        ) : null}

        {state.status === "error" ? (
          <div className="card-surface flex flex-col items-start gap-3 p-8">
            <p className="text-papaya-whip-100">
              I couldn&apos;t load my projects from GitHub.
            </p>
            <p className="text-sm text-steel-blue-300">{state.message}</p>
            <button
              type="button"
              onClick={() => {
                setState({ status: "loading" });
                fetch("/api/github")
                  .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok)
                      throw new Error(data?.error ?? "Failed to load.");
                    setState({ status: "ready", projects: data.projects });
                  })
                  .catch((err: unknown) =>
                    setState({
                      status: "error",
                      message:
                        err instanceof Error
                          ? err.message
                          : "Could not load projects.",
                    }),
                  );
              }}
              className="rounded-full bg-brick-red-500 px-4 py-2 text-sm font-medium text-papaya-whip-50 hover:bg-brick-red-400"
            >
              Try again
            </button>
          </div>
        ) : null}

        {state.status === "ready" && state.projects.length === 0 ? (
          <div className="card-surface p-8 text-steel-blue-200">
            No public projects to display yet.
          </div>
        ) : null}

        {state.status === "ready" && state.projects.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {state.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
