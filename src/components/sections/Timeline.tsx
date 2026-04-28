"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { timelineEntries } from "@/content/timeline";
import type { TimelineEntry, TimelineKind } from "@/types/content";
import { BeforeAfter } from "@/components/sections/BeforeAfter";

const KIND_META: Record<
  TimelineKind,
  { label: string; icon: "graduation-cap" | "trophy" | "briefcase" }
> = {
  education: { label: "Education", icon: "graduation-cap" },
  achievement: { label: "Achievement", icon: "trophy" },
  experience: { label: "Experience", icon: "briefcase" },
};

function TimelineCard({ entry }: { entry: TimelineEntry }) {
  const meta = KIND_META[entry.kind];
  return (
    <article
      className="card-surface group relative flex h-full w-[18rem] shrink-0 snap-start flex-col gap-4 p-6 transition-colors hover:border-brick-red-500/50 sm:w-[22rem]"
      aria-labelledby={`timeline-${entry.id}-title`}
    >
      <span
        aria-hidden
        className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full border border-steel-blue-700 bg-deep-space-blue-900 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-papaya-whip-300"
      >
        <Icon name={meta.icon} size={12} />
        {meta.label}
      </span>

      <div className="flex flex-col gap-1 pt-2">
        <p className="font-mono text-xs text-brick-red-300">{entry.period}</p>
        <h3
          id={`timeline-${entry.id}-title`}
          className="text-lg font-semibold text-papaya-whip-50"
        >
          {entry.title}
        </h3>
        {entry.subtitle ? (
          <p className="text-sm text-steel-blue-300">{entry.subtitle}</p>
        ) : null}
      </div>

      <p className="text-sm leading-relaxed text-steel-blue-200">
        {entry.description}
      </p>

      {entry.highlights && entry.highlights.length > 0 ? (
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {entry.highlights.map((h) => (
            <li
              key={h}
              className="rounded-full border border-steel-blue-700/70 bg-steel-blue-900/60 px-2 py-0.5 text-[11px] text-steel-blue-200"
            >
              {h}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function Timeline() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 1;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < max);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-timeline-card]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <section
      id="timeline"
      aria-labelledby="timeline-heading"
      className="py-24 sm:py-32"
    >
      <div className="section-shell">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brick-red-400">
              Journey
            </p>
            <h2
              id="timeline-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-papaya-whip-50 sm:text-4xl"
            >
              Education & achievements
            </h2>
            <p className="mt-3 max-w-2xl text-steel-blue-200">
              A scrollable highlight reel of milestones along the way. Drag,
              swipe, or use the arrows to navigate.
            </p>
          </div>

          <div
            className="hidden items-center gap-2 sm:flex"
            role="group"
            aria-label="Timeline navigation"
          >
            <button
              type="button"
              aria-label="Scroll timeline left"
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full border border-steel-blue-700 bg-deep-space-blue-900/60 text-papaya-whip-50 transition",
                canScrollLeft
                  ? "hover:border-brick-red-500/60 hover:bg-brick-red-500/15"
                  : "cursor-not-allowed opacity-40",
              )}
            >
              <Icon name="arrow-left" size={18} />
            </button>
            <button
              type="button"
              aria-label="Scroll timeline right"
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full border border-steel-blue-700 bg-deep-space-blue-900/60 text-papaya-whip-50 transition",
                canScrollRight
                  ? "hover:border-brick-red-500/60 hover:bg-brick-red-500/15"
                  : "cursor-not-allowed opacity-40",
              )}
            >
              <Icon name="arrow-right" size={18} />
            </button>
          </div>
        </header>

        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-deep-space-blue-950 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-deep-space-blue-950 to-transparent"
          />

          <div
            ref={scrollerRef}
            tabIndex={0}
            role="region"
            aria-label="Education and achievements timeline"
            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 pt-6"
          >
            {timelineEntries.map((entry) => (
              <div key={entry.id} data-timeline-card>
                <TimelineCard entry={entry} />
              </div>
            ))}
          </div>

          <div
            aria-hidden
            className="pointer-events-none mx-6 h-px bg-gradient-to-r from-transparent via-steel-blue-700 to-transparent"
          />
        </div>

        <BeforeAfter />
      </div>
    </section>
  );
}
