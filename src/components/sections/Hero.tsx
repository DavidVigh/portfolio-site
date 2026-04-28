import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { siteContent } from "@/content/site";

export function Hero() {
  return (
    <section
      id="intro"
      aria-labelledby="intro-heading"
      className="relative isolate overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-brick-red-700/20 blur-3xl" />
        <div className="absolute right-[10%] top-[10%] h-72 w-72 rounded-full bg-deep-space-blue-500/15 blur-3xl" />
      </div>

      <div className="section-shell">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="chip mb-6">
            <span
              aria-hidden
              className="relative flex h-2 w-2"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-brick-red-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brick-red-500" />
            </span>
            Available for new projects
          </span>

          <h1
            id="intro-heading"
            className="bg-gradient-to-b from-papaya-whip-50 via-papaya-whip-100 to-papaya-whip-300 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-6xl"
          >
            {siteContent.tagline}
          </h1>

          <p className="mt-3 text-lg font-medium text-brick-red-300 sm:text-xl">
            Hi, I&apos;m{" "}
            <span className="text-papaya-whip-50">{siteContent.name}</span> —{" "}
            {siteContent.role}.
          </p>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel-blue-200 sm:text-lg">
            {siteContent.intro}
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="#works"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brick-red-500 px-6 py-3 text-base font-medium text-papaya-whip-50 shadow-lg shadow-brick-red-900/40 transition-all hover:-translate-y-0.5 hover:bg-brick-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-papaya-whip-400"
            >
              View my works
              <Icon name="arrow-right" size={18} />
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-steel-blue-700 bg-steel-blue-900/40 px-6 py-3 text-base font-medium text-papaya-whip-50 backdrop-blur-sm transition-colors hover:border-papaya-whip-400/50 hover:bg-steel-blue-900/70"
            >
              Order a website
              <Icon name="email" size={18} />
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm text-steel-blue-300">
            <li className="chip">Next.js</li>
            <li className="chip">TypeScript</li>
            <li className="chip">Tailwind CSS</li>
            <li className="chip">Node.js</li>
            <li className="chip">PostgreSQL</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
