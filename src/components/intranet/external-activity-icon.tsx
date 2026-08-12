import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

export function ExternalActivityGlobeIcon({ className }: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" className={cn("shrink-0 drop-shadow-[0_0_8px_rgba(59,130,246,0.45)]", className)} fill="none" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="external-globe-stroke" x1="12" x2="52" y1="10" y2="54" gradientUnits="userSpaceOnUse"><stop stopColor="#BAE6FD" /><stop offset=".48" stopColor="#38BDF8" /><stop offset="1" stopColor="#6366F1" /></linearGradient>
        <radialGradient id="external-globe-fill" cx="0" cy="0" r="1" gradientTransform="translate(27 22) rotate(50) scale(39)" gradientUnits="userSpaceOnUse"><stop stopColor="#2563EB" stopOpacity=".42" /><stop offset="1" stopColor="#020617" stopOpacity=".9" /></radialGradient>
      </defs>
      <circle cx="32" cy="32" r="24" fill="url(#external-globe-fill)" stroke="url(#external-globe-stroke)" strokeWidth="2.2" />
      <path d="M8 32h48M32 8c8 7 12 15 12 24S40 49 32 56M32 8c-8 7-12 15-12 24s4 17 12 24M12.5 20h39M12.5 44h39" stroke="#E0F2FE" strokeLinecap="round" strokeOpacity=".88" strokeWidth="1.8" />
      <circle cx="32" cy="8" r="3.2" fill="#60A5FA" stroke="#DBEAFE" /><circle cx="56" cy="32" r="3.2" fill="#A78BFA" stroke="#EDE9FE" /><circle cx="32" cy="56" r="3.2" fill="#FACC15" stroke="#FEF9C3" /><circle cx="8" cy="32" r="3.2" fill="#22D3EE" stroke="#CFFAFE" />
      <circle cx="48" cy="16" r="2.2" fill="#38BDF8" /><circle cx="16" cy="48" r="2.2" fill="#818CF8" />
    </svg>
  );
}
