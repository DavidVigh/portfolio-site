import type { SiteContent } from "@/types/content";

/**
 * Single source of truth for personal/site copy.
 *
 * To swap to a CMS later, implement a loader returning `SiteContent` and
 * import that instead.
 */
export const siteContent: SiteContent = {
  name: "David Vigh",
  role: "Full-Stack Software Engineer",
  tagline: "End-to-end web engineering. Built to ship.",
  intro:
    "I'm a Full-Stack Software Engineer specializing in Next.js, TypeScript, and API automation. From AI-integrated full-stack platforms to overnight deployments for US teams from CET, I help products move faster without breaking trust.",
  location: "Budapest, Hungary (CET)",
  githubUsername: "DavidVigh",
  socials: [
    {
      label: "GitHub",
      href: "https://github.com/DavidVigh",
      icon: "github",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/david-hunor-vigh",
      icon: "linkedin",
    },
    {
      label: "Email",
      href: "mailto:david.vigh08@gmail.com",
      icon: "email",
    },
  ],
};
