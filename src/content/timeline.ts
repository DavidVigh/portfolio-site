import type { TimelineEntry } from "@/types/content";

/**
 * Education + experience + achievements timeline.
 *
 * Sorted oldest -> newest (left -> right) so the horizontal scroller reads
 * as a natural journey, ending at "where I am now". Edit entries here.
 */
export const timelineEntries: TimelineEntry[] = [
  {
    id: "education-bmszc",
    kind: "education",
    title: "BMSZC Neumann János Technical School",
    subtitle: "Software Developer & Tester",
    period: "Sep 2020 — Jun 2025",
    startDate: "2020-09-01",
    description:
      "Five-year technical secondary program with a specialization in software development and testing. Graduated as a certified Software Developer & Tester.",
    highlights: ["HTML & CSS", "JavaScript", "SQL", "Unit testing", "Bootstrap", "Tailwind", "Vue", "Laravel", "Python", "C#"],
    location: "Budapest, Hungary",
  },
  {
    id: "achievement-icdl",
    kind: "achievement",
    title: "ICDL — International Certification of Digital Literacy",
    period: "September 2023",
    startDate: "2023-09-01",
    description:
      "Internationally recognized certification covering core digital literacy and computing competencies.",
    highlights: ["Computer essentials", "Online essentials", "Productivity tools"],
  },
  {
    id: "experience-independent",
    kind: "experience",
    title: "Independent Fullstack Developer",
    subtitle: "Self-employed",
    period: "Jan 2025 — Present",
    startDate: "2025-01-01",
    description:
      "Specializing in Next.js, TypeScript, and API automation, operating from CET.",
    highlights: ["Next.js", "TypeScript", "Node.js", "API automation", "PostgreSQL"],
    location: "Remote",
  },
  {
    id: "achievement-song-tailor",
    kind: "achievement",
    title: "Architected 'Song Tailor' platform",
    period: "2025",
    startDate: "2025-06-01",
    description:
      "Designed and built a full-stack order management platform for music production. Integrated Google Gemini AI to parse and summarize complex client production instructions, plus Discord webhooks for instant order alerts. Implemented secure auth and a relational database to track project status end-to-end.",
    highlights: [
      "Next.js",
      "TypeScript",
      "Gemini AI",
      "Discord Webhooks",
      "Auth & relational DB",
    ],
  },
  {
    id: "education-gabor-denes",
    kind: "education",
    title: "Gábor Dénes University",
    subtitle: "BSc in Software Engineering",
    period: "Sep 2025 — May 2029",
    startDate: "2025-09-01",
    description:
      "Bachelor of Software Engineering, pursued in parallel with full-time professional work.",
    highlights: ["Software engineering", "CS fundamentals"],
    location: "Budapest, Hungary",
  },
  {
    id: "experience-thyssenkrupp",
    kind: "experience",
    title: "Software Tester — thyssenkrupp Components Technology",
    subtitle: "thyssenkrupp",
    period: "Jan 2026 — Present",
    startDate: "2026-01-01",
    description:
      "Engineering and maintaining robust E2E automated test suites with Cypress to harden critical front-end plugins. Transforming manual QA processes into automated pipelines that accelerate release cycles and eliminate human error.",
    highlights: ["Cypress", "E2E testing", "CI/CD", "QA automation"],
    location: "Budapest, Hungary",
  },
];
