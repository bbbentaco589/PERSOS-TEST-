import Image from "next/image";
import { Building2 } from "lucide-react";

import { divisionIconAssets } from "@/constants/assets";
import { cn } from "@/lib/utils";

export function DivisionIcon({
  compact = false,
  featured = false,
  divisionId,
  className,
}: {
  compact?: boolean;
  featured?: boolean;
  divisionId: string;
  className?: string;
}) {
  const asset = divisionIconAssets[divisionId];

  if (!asset) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "grid shrink-0 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/[0.07] text-cyan-200",
          compact ? "size-6" : featured ? "size-24" : "size-10",
          className
        )}
      >
        <Building2 className={featured ? "size-10" : "size-1/2"} strokeWidth={1.8} />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 place-items-center",
        compact ? "size-6" : featured ? "size-24" : "size-10",
        className
      )}
      data-division-icon={divisionId}
    >
      <Image
        alt=""
        className={cn(
          "object-contain",
          compact
            ? "scale-[1.15] drop-shadow-[0_0_6px_rgba(255,255,255,0.14)]"
            : featured
              ? "scale-[1.08] p-1 drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
              : "scale-[1.1] p-0.5 drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
        )}
        fill
        loading={featured ? "eager" : "lazy"}
        sizes={compact ? "24px" : featured ? "96px" : "40px"}
        src={asset}
      />
    </span>
  );
}
