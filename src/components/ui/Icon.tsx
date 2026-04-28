import type { ReactNode, SVGProps } from "react";

type IconName =
  | "github"
  | "linkedin"
  | "x"
  | "email"
  | "globe"
  | "external"
  | "star"
  | "fork"
  | "arrow-right"
  | "arrow-left"
  | "menu"
  | "close"
  | "check"
  | "spinner"
  | "graduation-cap"
  | "trophy"
  | "briefcase";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

const PATHS: Record<IconName, ReactNode> = {
  github: (
    <path
      d="M12 .5a11.5 11.5 0 0 0-3.63 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.92 10.92 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
      fill="currentColor"
    />
  ),
  linkedin: (
    <path
      d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.22 8h4.56v14H.22V8Zm7.7 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v7.44h-4.55v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.49V22h-4.55V8Z"
      fill="currentColor"
    />
  ),
  x: (
    <path
      d="M18.244 2H21.5l-7.5 8.57L23 22h-6.78l-5.31-6.94L4.86 22H1.6l8.04-9.18L1 2h6.91l4.8 6.34L18.244 2Zm-2.38 18h1.88L7.22 4H5.21l10.66 16Z"
      fill="currentColor"
    />
  ),
  email: (
    <path
      d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.4l9 5.4 9-5.4V7H3Zm18 2.6-8.47 5.08a1 1 0 0 1-1.06 0L3 9.6V17h18V9.6Z"
      fill="currentColor"
    />
  ),
  globe: (
    <path
      d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 9h-3a15.4 15.4 0 0 0-1.16-5.21A8.03 8.03 0 0 1 18.93 11ZM12 4c.86 0 2.13 2.21 2.71 7H9.29C9.87 6.21 11.14 4 12 4ZM5.07 11a8.03 8.03 0 0 1 4.16-5.21A15.4 15.4 0 0 0 8.07 11H5.07Zm0 2H8.07c.13 1.85.5 3.61 1.16 5.21A8.03 8.03 0 0 1 5.07 13Zm6.93 7c-.86 0-2.13-2.21-2.71-7h5.42C14.13 17.79 12.86 20 12 20Zm2.77-1.79A15.4 15.4 0 0 0 15.93 13h3a8.03 8.03 0 0 1-4.16 5.21Z"
      fill="currentColor"
    />
  ),
  external: (
    <path
      d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"
      fill="currentColor"
    />
  ),
  star: (
    <path
      d="m12 17.27 5.18 3.13-1.37-5.89L20 9.74l-6-.51L12 3 10 9.23l-6 .51 4.19 4.77-1.37 5.89L12 17.27Z"
      fill="currentColor"
    />
  ),
  fork: (
    <path
      d="M6 3a3 3 0 0 0-1 5.83V11a3 3 0 0 0 3 3h3v2.17A3 3 0 1 0 13 16.17V14h3a3 3 0 0 0 3-3V8.83A3 3 0 1 0 17 8.83V11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8.83A3 3 0 0 0 6 3Zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm12 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-6 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
      fill="currentColor"
    />
  ),
  "arrow-right": (
    <path
      d="M5 12h12.5l-4.75-4.75 1.41-1.41L21.41 12l-7.25 7.16-1.41-1.41L17.5 13H5v-1Z"
      fill="currentColor"
    />
  ),
  "arrow-left": (
    <path
      d="M19 12H6.5l4.75-4.75-1.41-1.41L2.59 12l7.25 7.16 1.41-1.41L6.5 13H19v-1Z"
      fill="currentColor"
    />
  ),
  menu: (
    <path
      d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"
      fill="currentColor"
    />
  ),
  close: (
    <path
      d="m6.4 4.99 5.6 5.6 5.6-5.6 1.41 1.41L13.41 12l5.6 5.6-1.41 1.41-5.6-5.6-5.6 5.6L4.99 17.6l5.6-5.6-5.6-5.6L6.4 4.99Z"
      fill="currentColor"
    />
  ),
  check: (
    <path
      d="m9 16.17-3.88-3.88L3.7 13.7 9 19l11-11-1.42-1.42L9 16.17Z"
      fill="currentColor"
    />
  ),
  spinner: (
    <path
      d="M12 2a10 10 0 0 1 10 10h-2a8 8 0 1 0-8 8v2A10 10 0 0 1 12 2Z"
      fill="currentColor"
    />
  ),
  "graduation-cap": (
    <path
      d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm0 14.18L5 13.36V11l7 3.82L19 11v2.36l-7 3.82Z"
      fill="currentColor"
    />
  ),
  trophy: (
    <path
      d="M19 4h-3V2H8v2H5a2 2 0 0 0-2 2v3a4 4 0 0 0 4 4h.34A6 6 0 0 0 11 16.92V19H8v2h8v-2h-3v-2.08A6 6 0 0 0 16.66 13H17a4 4 0 0 0 4-4V6a2 2 0 0 0-2-2ZM5 9V6h2v5a2 2 0 0 1-2-2Zm14 0a2 2 0 0 1-2 2V6h2v3Z"
      fill="currentColor"
    />
  ),
  briefcase: (
    <path
      d="M10 2h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2Zm0 2v2h4V4h-4ZM4 8v3h16V8H4Zm0 5v6h16v-6h-6v2h-4v-2H4Z"
      fill="currentColor"
    />
  ),
};

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
