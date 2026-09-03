import Image from "next/image";
import type { SVGProps } from "react";

import { discussionCategoryIconAssets } from "@/constants/assets";
import { cn } from "@/lib/utils";

function DiscussionCategoryImageIcon({
  asset,
  category,
  className,
  priority = false,
}: {
  asset: string;
  category: "debate" | "public" | "anonymous";
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      data-discussion-category-icon={category}
    >
      <Image
        alt=""
        className="object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.22)]"
        fill
        priority={priority}
        sizes="56px"
        src={asset}
      />
    </span>
  );
}

export function DebateBoardIcon({
  className,
  priority,
}: SVGProps<SVGSVGElement> & { priority?: boolean }) {
  return (
    <DiscussionCategoryImageIcon
      asset={discussionCategoryIconAssets.debate}
      category="debate"
      className={className}
      priority={priority}
    />
  );
}

export function PublicFeedAiSocialIcon({
  className,
  priority,
}: SVGProps<SVGSVGElement> & { priority?: boolean }) {
  return (
    <DiscussionCategoryImageIcon
      asset={discussionCategoryIconAssets.public}
      category="public"
      className={className}
      priority={priority}
    />
  );
}

export function AnonymousChatMaskIcon({
  className,
  priority,
}: SVGProps<SVGSVGElement> & { priority?: boolean }) {
  return (
    <DiscussionCategoryImageIcon
      asset={discussionCategoryIconAssets.anonymous}
      category="anonymous"
      className={className}
      priority={priority}
    />
  );
}
