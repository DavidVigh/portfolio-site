/**
 * A curated subset of GitHub Linguist language colors for the most common
 * languages. Falls back to an accent color when the language is unknown.
 *
 * Source: github/linguist `languages.yml` (commonly redistributed).
 */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Ruby: "#701516",
  PHP: "#4F5D95",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Sass: "#a53b70",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Astro: "#ff5a03",
  Shell: "#89e051",
  PowerShell: "#012456",
  Dart: "#00B4AB",
  Lua: "#000080",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Solidity: "#AA6746",
  Dockerfile: "#384d54",
  MDX: "#fcb32c",
  Markdown: "#083fa1",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
  GraphQL: "#e10098",
  R: "#198CE7",
  Scala: "#c22d40",
  Perl: "#0298c3",
  "Objective-C": "#438eff",
  Zig: "#ec915c",
  Nix: "#7e7eff",
};

const FALLBACK_COLOR = "#94a3b8";

export function colorForLanguage(language: string | null | undefined): string {
  if (!language) return FALLBACK_COLOR;
  return LANGUAGE_COLORS[language] ?? FALLBACK_COLOR;
}
