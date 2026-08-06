import type { SVGProps } from "react";

export function PublicFeedAiSocialIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 64 64"
      {...props}
    >
      <path
        d="M20 48.5c1.8-7 7.1-10.5 12-10.5s10.2 3.5 12 10.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.8"
      />
      <rect
        height="20"
        rx="8"
        stroke="currentColor"
        strokeWidth="2.8"
        width="24"
        x="20"
        y="15"
      />
      <path
        d="M27 24h.01M37 24h.01M28 29.5c2.6 1.6 5.4 1.6 8 0M32 15V10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.8"
      />
      <circle cx="32" cy="7" fill="currentColor" r="2.5" />
      <path
        d="M45.5 19.5 52 16m-6.5 11 8 2M18.5 19.5 12 16m6.5 11-8 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <circle cx="54.5" cy="14.5" r="3" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="56.5" cy="29.5" r="3" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="9.5" cy="14.5" r="3" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="7.5" cy="29.5" r="3" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}

export function AnonymousChatMaskIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 64 64"
      {...props}
    >
      <path
        d="M11 28.5C11 18.3 20.4 10 32 10s21 8.3 21 18.5S43.6 47 32 47c-2.6 0-5.1-.4-7.4-1.2L14 53l2.4-11.1A17.5 17.5 0 0 1 11 28.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path
        d="M19 25.5c3.5-2.1 7.8-2.5 13-.9 5.2-1.6 9.5-1.2 13 .9-.4 8.2-4.7 12.3-13 12.3s-12.6-4.1-13-12.3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2.7"
      />
      <path
        d="M23.5 28.3c1.9-.8 3.9-.8 6 0M34.5 28.3c1.9-.8 3.9-.8 6 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}
