import type { GrowthContent } from "@/types/content";

/**
 * "Then -> Now" content powering the BeforeAfter block under the timeline.
 *
 * `before` represents post-school skills/experiences — the starting point.
 * `after`  represents present-day skills/experiences — where things are now.
 */
export const growthContent: GrowthContent = {
  before: {
    label: "Right after high school",
    period: "Mid 2025",
    headline:
      "Graduated BMSZC Neumann János as a Software Developer & Tester. Strong fundamentals and a hunger to ship real products.",
    skills: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "SQL",
      "Manual testing",
      "Git",
      "Bootstrap",
      "SASS/SCSS",
    ],
    highlights: [
      "5 years of structured technical training in software development and testing",
      "ICDL certified (2023) — solid digital literacy baseline",
      "First independent client projects shipped",
    ],
  },
  after: {
    label: "Where I am now",
    period: "2026 — Present",
    headline:
      "Full-stack engineer at thyssenkrupp + independent developer. Shipping production code with modern stacks, automation, and AI integrations.",
    skills: [
      "TypeScript",
      "React",
      "React Native",
      "Next.js",
      "Node.js",
      "C#",
      "Python",
      "PostgreSQL",
      "MySQL",
      "Tailwind CSS",
      "Vite",
      "Cypress",
      "Gemini AI",
      "Discord Webhooks",
    ],
    highlights: [
      "Building E2E test infrastructure with Cypress for a global automotive supplier",
      "Architected and shipped 'Song Tailor' — a full-stack platform with AI-driven parsing",
      "Independent client work specializing in Next.js, TypeScript, and API automation",
      "Operating from CET to ship overnight deploys for US teams without disrupting users",
    ],
  },
};
