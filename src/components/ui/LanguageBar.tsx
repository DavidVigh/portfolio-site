import type { LanguageBreakdown } from "@/types/content";

type LanguageBarProps = {
  languages: LanguageBreakdown[];
  /** How many language chips to show below the bar; the rest are summed. */
  maxVisible?: number;
};

/**
 * GitHub-like horizontal stacked bar showing language usage percentages.
 */
export function LanguageBar({ languages, maxVisible = 4 }: LanguageBarProps) {
  if (languages.length === 0) {
    return (
      <p className="text-xs italic text-steel-blue-400">
        No language data available.
      </p>
    );
  }

  const visible = languages.slice(0, maxVisible);
  const rest = languages.slice(maxVisible);
  const restPercent = rest.reduce((sum, lang) => sum + lang.percent, 0);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-steel-blue-900/80"
        role="img"
        aria-label={`Language breakdown: ${visible
          .map((l) => `${l.name} ${l.percent.toFixed(1)}%`)
          .join(", ")}`}
      >
        {visible.map((lang) => (
          <span
            key={lang.name}
            style={{
              width: `${lang.percent}%`,
              backgroundColor: lang.color,
            }}
            className="h-full"
          />
        ))}
        {restPercent > 0 ? (
          <span
            style={{ width: `${restPercent}%` }}
            className="h-full bg-steel-blue-700"
          />
        ) : null}
      </div>
      <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-steel-blue-200">
        {visible.map((lang) => (
          <li key={lang.name} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: lang.color }}
            />
            <span className="font-medium text-papaya-whip-50">{lang.name}</span>
            <span className="text-steel-blue-400">
              {lang.percent.toFixed(1)}%
            </span>
          </li>
        ))}
        {rest.length > 0 ? (
          <li className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full bg-steel-blue-700"
            />
            <span className="font-medium text-papaya-whip-50">Other</span>
            <span className="text-steel-blue-400">
              {restPercent.toFixed(1)}%
            </span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
