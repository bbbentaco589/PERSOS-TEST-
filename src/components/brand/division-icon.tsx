import {
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  Clapperboard,
  Cpu,
  Newspaper,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { designAssets } from "@/constants/assets";
import { cn } from "@/lib/utils";

const iconPositionByDivision: Record<string, string> = {
  "division-intelligence": "-119px -115px",
  "division-governance": "-442px -115px",
  "division-studio": "-362px -115px",
  "division-strategy": "-279px -115px",
  "division-editorial": "-199px -115px",
  "division-entertainment": "-279px -115px",
};

const compactIconByDivision: Record<string, LucideIcon> = {
  "division-strategy": BriefcaseBusiness,
  "division-governance": ChartNoAxesCombined,
  "division-entertainment": Clapperboard,
  "division-editorial": Newspaper,
  "division-intelligence": UsersRound,
  "division-studio": Cpu,
};

function getFeaturedIconPosition(divisionId: string) {
  const [x = "-119px", y = "-115px"] = (
    iconPositionByDivision[divisionId] ?? "-119px -115px"
  ).split(" ");

  return `${Number.parseInt(x) * 2}px ${Number.parseInt(y) * 2}px`;
}

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
  if (compact) {
    const Icon = compactIconByDivision[divisionId] ?? Building2;

    return (
      <span
        aria-hidden="true"
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-[3px] border border-cyan-300/25 bg-cyan-300/[0.07] text-cyan-200",
          className
        )}
      >
        <Icon className="size-3" strokeWidth={1.8} />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden border border-white/10 bg-[#081126]",
        featured
          ? "size-20 rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.12)]"
          : "size-10 rounded-md",
        className
      )}
    >
      <span
        className={cn("block shrink-0", featured ? "size-16" : "size-8")}
        style={{
          backgroundImage: `url(${designAssets.divisionIconOverview})`,
          backgroundPosition: featured
            ? getFeaturedIconPosition(divisionId)
            : iconPositionByDivision[divisionId] ?? "-119px -115px",
          backgroundRepeat: "no-repeat",
          backgroundSize: featured ? "1028px 578px" : "514px 289px",
        }}
      />
    </span>
  );
}
