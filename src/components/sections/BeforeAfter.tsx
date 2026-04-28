import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { growthContent } from "@/content/growth";
import type { GrowthSnapshot } from "@/types/content";

type Variant = "before" | "after";

function GrowthCard({
  data,
  variant,
}: {
  data: GrowthSnapshot;
  variant: Variant;
}) {
  const isAfter = variant === "after";
  return (
    <article
      className={cn(
        "card-surface relative flex h-full flex-col gap-5 p-6 sm:p-8",
        isAfter
          ? "border-brick-red-500/40 shadow-[0_0_50px_-12px_rgba(233,22,36,0.4)]"
          : "border-steel-blue-800/70",
      )}
      aria-labelledby={`growth-${variant}-title`}
    >
      <header className="flex flex-col gap-2">
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
            isAfter
              ? "border border-brick-red-500/50 bg-brick-red-500/15 text-brick-red-200"
              : "border border-steel-blue-700 bg-steel-blue-900/60 text-steel-blue-200",
          )}
        >
          {isAfter ? "Now" : "Before"}
        </span>
        <p className="font-mono text-xs text-papaya-whip-300">{data.period}</p>
        <h3
          id={`growth-${variant}-title`}
          className="text-xl font-bold tracking-tight text-papaya-whip-50 sm:text-2xl"
        >
          {data.label}
        </h3>
      </header>

      <p className="text-sm leading-relaxed text-steel-blue-200">
        {data.headline}
      </p>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-steel-blue-400">
          Skills
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {data.skills.map((skill) => (
            <li
              key={skill}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs",
                isAfter
                  ? "border-brick-red-500/40 bg-brick-red-500/10 text-papaya-whip-100"
                  : "border-steel-blue-700/70 bg-steel-blue-900/60 text-steel-blue-200",
              )}
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-steel-blue-400">
          Highlights
        </p>
        <ul className="space-y-2 text-sm text-steel-blue-200">
          {data.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2">
              <Icon
                name="check"
                size={16}
                className={cn(
                  "mt-0.5 flex-shrink-0",
                  isAfter ? "text-brick-red-400" : "text-steel-blue-400",
                )}
              />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function ArrowConnector() {
  return (
    <div
      aria-hidden
      className="flex items-center justify-center lg:px-2"
    >
      {/* Compact vertical arrow on mobile/tablet (between stacked cards) */}
      <svg
        width="56"
        height="80"
        viewBox="0 0 56 80"
        xmlns="http://www.w3.org/2000/svg"
        className="lg:hidden"
        role="img"
        aria-label="Arrow pointing from the before card to the after card"
      >
        <defs>
          <linearGradient id="arrow-grad-vert" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#71a2c1" />
            <stop offset="100%" stopColor="#e91624" />
          </linearGradient>
        </defs>
        <circle cx="28" cy="6" r="4" fill="#71a2c1" />
        <line
          x1="28"
          y1="10"
          x2="28"
          y2="64"
          stroke="url(#arrow-grad-vert)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polyline
          points="20,58 28,72 36,58"
          fill="none"
          stroke="#e91624"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wide horizontal arrow on desktop (between side-by-side cards) */}
      <svg
        width="120"
        height="48"
        viewBox="0 0 120 48"
        xmlns="http://www.w3.org/2000/svg"
        className="hidden lg:block"
        role="img"
        aria-label="Arrow pointing from the before card to the after card"
      >
        <defs>
          <linearGradient
            id="arrow-grad-horiz"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#71a2c1" />
            <stop offset="100%" stopColor="#e91624" />
          </linearGradient>
        </defs>
        <circle cx="6" cy="24" r="4" fill="#71a2c1" />
        <line
          x1="10"
          y1="24"
          x2="100"
          y2="24"
          stroke="url(#arrow-grad-horiz)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polyline
          points="92,16 110,24 92,32"
          fill="none"
          stroke="#e91624"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function BeforeAfter() {
  return (
    <div className="mt-16 sm:mt-20" aria-labelledby="growth-heading">
      <header className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brick-red-400">
          Then &rarr; Now
        </p>
        <h3
          id="growth-heading"
          className="mt-2 text-2xl font-bold tracking-tight text-papaya-whip-50 sm:text-3xl"
        >
          From graduation to shipping production code
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-steel-blue-200">
          A side-by-side look at where I started after high school and where
          I&apos;ve grown to today.
        </p>
      </header>

      <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <GrowthCard data={growthContent.before} variant="before" />
        <ArrowConnector />
        <GrowthCard data={growthContent.after} variant="after" />
      </div>
    </div>
  );
}
