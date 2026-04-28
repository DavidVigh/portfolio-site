import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { siteContent } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-steel-blue-800/60 bg-deep-space-blue-950/60">
      <div className="section-shell flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <p className="text-sm text-steel-blue-300">
          &copy; {new Date().getFullYear()} {siteContent.name}. Built with
          Next.js & Tailwind.
        </p>
        <ul className="flex items-center gap-2">
          {siteContent.socials.map((social) => (
            <li key={social.label}>
              <Link
                href={social.href}
                target={social.icon === "email" ? undefined : "_blank"}
                rel="noreferrer"
                aria-label={social.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-steel-blue-800 text-steel-blue-200 transition-colors hover:border-brick-red-500/60 hover:bg-brick-red-500/10 hover:text-papaya-whip-50"
              >
                <Icon name={social.icon} size={18} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
