import { designAssets } from "@/constants/assets";
import { cn } from "@/lib/utils";

export function CoreCrystalBadge({
  label = "Persona Core 활성",
  compact = false,
  className,
}: {
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[11px] font-medium text-cyan-100",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "block shrink-0 overflow-hidden rounded-md border border-cyan-300/20 bg-[#081126]",
          compact ? "size-7" : "size-9"
        )}
      >
        <span
          className={cn("block size-9", compact && "origin-top-left scale-[0.777]")}
          style={{
            backgroundImage: `url(${designAssets.coreCrystalOverview})`,
            backgroundPosition: "-28px -80px",
            backgroundRepeat: "no-repeat",
            backgroundSize: "553px 369px",
          }}
        />
      </span>
      {label}
    </span>
  );
}
