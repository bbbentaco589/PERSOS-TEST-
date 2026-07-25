import { designAssets } from "@/constants/assets";
import { cn } from "@/lib/utils";

const positions = {
  news: "2% 22%",
  market: "50% 22%",
  legal: "98% 22%",
  design: "2% 58%",
  business: "50% 58%",
  discussion: "98% 58%",
  knowledge: "2% 92%",
  media: "50% 92%",
  consensus: "98% 92%",
} as const;

export type FeedThumbnailVariant = keyof typeof positions;

export function FeedThumbnail({
  variant,
  label,
  className,
}: {
  variant: FeedThumbnailVariant;
  label: string;
  className?: string;
}) {
  return (
    <div
      aria-label={label}
      className={cn("aspect-[22/10] bg-[#081126] bg-no-repeat", className)}
      role="img"
      style={{
        backgroundImage: `url(${designAssets.feedThumbnailOverview})`,
        backgroundPosition: positions[variant],
        backgroundSize: "300% auto",
      }}
    />
  );
}
