"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { siteContent } from "@/content/site";

const NAV_LINKS = [
  { href: "#intro", label: "Intro" },
  { href: "#works", label: "Works" },
  { href: "#timeline", label: "Timeline" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("#intro");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0.1, 0.25, 0.5, 0.75] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled
          ? "border-b border-steel-blue-800/60 bg-deep-space-blue-950/80 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="section-shell flex h-16 items-center justify-between">
        <Link
          href="#intro"
          className="group flex items-center gap-2 text-papaya-whip-50"
        >
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brick-red-500 to-molten-lava-700 font-mono text-sm font-bold text-papaya-whip-50 shadow-lg shadow-brick-red-900/40 transition-transform group-hover:rotate-3"
          >
            {siteContent.name.charAt(0).toUpperCase()}
          </span>
          <span className="font-semibold tracking-tight">
            {siteContent.name}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm transition-colors",
                      isActive
                        ? "text-papaya-whip-50"
                        : "text-steel-blue-300 hover:text-papaya-whip-50",
                    )}
                  >
                    {isActive ? (
                      <span
                        aria-hidden
                        className="absolute inset-0 -z-10 rounded-full bg-brick-red-500/15 ring-1 ring-brick-red-500/40"
                      />
                    ) : null}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden md:block">
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-brick-red-500 px-4 py-2 text-sm font-medium text-papaya-whip-50 shadow-lg shadow-brick-red-900/30 transition-colors hover:bg-brick-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-papaya-whip-400"
          >
            Order a website
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-steel-blue-800 text-papaya-whip-50 md:hidden"
        >
          <Icon name={open ? "close" : "menu"} size={22} />
        </button>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          "border-b border-steel-blue-800/60 bg-deep-space-blue-950/95 backdrop-blur md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav aria-label="Mobile" className="section-shell py-4">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-lg px-4 py-3 text-base transition-colors",
                      isActive
                        ? "bg-brick-red-500/15 text-papaya-whip-50"
                        : "text-steel-blue-200 hover:bg-steel-blue-900/50",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <Link
                href="#contact"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-brick-red-500 px-4 py-3 text-base font-medium text-papaya-whip-50"
              >
                Order a website
                <Icon name="arrow-right" size={16} />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
