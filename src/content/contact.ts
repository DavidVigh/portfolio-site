import type { ContactContent } from "@/types/content";

/**
 * Copy + option lists for the contact/order section. Keeping these here means
 * the form UI stays identical when content moves into a CMS later.
 */
export const contactContent: ContactContent = {
  heading: "Let's build something",
  subheading:
    "Looking for a developer to build your website or web app? Send me the details and I'll reply within two business days.",
  responseNote: "Typical response time: under 48 hours.",
  services: [
    {
      id: "landing-page",
      label: "Landing / marketing site",
      description: "1–5 pages, high-conversion focus.",
    },
    {
      id: "portfolio",
      label: "Portfolio website",
      description: "Personal or agency portfolio.",
    },
    {
      id: "web-app",
      label: "Web application",
      description: "Custom dashboard, SaaS MVP, or product.",
    },
    {
      id: "ecommerce",
      label: "E-commerce store",
      description: "Custom storefront or Shopify build.",
    },
    {
      id: "other",
      label: "Other / not sure yet",
    },
  ],
  budgets: [
    { id: "lt-1k", label: "Under €1,000" },
    { id: "1k-3k", label: "€1,000 — €3,000" },
    { id: "3k-7k", label: "€3,000 — €7,000" },
    { id: "7k-plus", label: "€7,000+" },
    { id: "discuss", label: "Let's discuss" },
  ],
};
