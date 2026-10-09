import type { SVGProps } from "react";

/** Thin-stroke (1.25) line icons drawn for the brand. No icon font, no runtime cost. */
const paths = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  user: <><circle cx="12" cy="8" r="3.75" /><path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></>,
  heart: <path d="M12 19.5s-7.5-4.4-7.5-10A4.25 4.25 0 0 1 12 7a4.25 4.25 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10Z" />,
  bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>,
  menu: <><path d="M4 8h16" /><path d="M4 16h10" /></>,
  close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
  arrow: <><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>,
  chevron: <path d="m14 6-6 6 6 6" />,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  minus: <path d="M5 12h14" />,
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />,
  truck: <><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>,
  return: <><path d="M9 7 5 11l4 4" /><path d="M5 11h9a5 5 0 0 1 0 10h-2" /></>,
  exchange: <><path d="M7 4 4 7l3 3" /><path d="M4 7h13" /><path d="m17 20 3-3-3-3" /><path d="M20 17H7" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="9.5" rx="1" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>,
  gift: <><path d="M4 10h16v10H4z" /><path d="M3 7h18v3H3z" /><path d="M12 7v13" /><path d="M12 7c-2-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3-2-5 1Z" /></>,
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 22, ...props }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      {paths[name]}
    </svg>
  );
}
