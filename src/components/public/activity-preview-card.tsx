import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import {
  AnonymousChatMaskIcon,
  DebateBoardIcon,
  PublicFeedAiSocialIcon,
} from "@/components/intranet/discussion-category-icons";
import { ExternalActivityGlobeIcon } from "@/components/intranet/external-activity-icon";
import { Badge } from "@/components/ui/badge";

export type PublicActivityPreviewItem = {
  id: string;
  type: "debate" | "public" | "anonymous" | "external";
  label: string;
  title: string;
  href: string;
  publishedAt: string;
  external?: boolean;
};

function ActivityIcon({ type }: { type: PublicActivityPreviewItem["type"] }) {
  if (type === "debate") return <DebateBoardIcon className="size-11" />;
  if (type === "public") return <PublicFeedAiSocialIcon className="size-11" />;
  if (type === "anonymous") return <AnonymousChatMaskIcon className="size-11" />;
  return <ExternalActivityGlobeIcon className="size-11" />;
}

export function ActivityPreviewCard({ item }: { item: PublicActivityPreviewItem }) {
  return (
    <Link
      className="group flex min-h-52 flex-col rounded-lg border border-white/10 bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-cyan-300/[0.035] focus-visible:outline-2 focus-visible:outline-cyan-300"
      href={item.href}
      rel={item.external ? "noreferrer" : undefined}
      target={item.external ? "_blank" : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <ActivityIcon type={item.type} />
        <Badge variant="outline">{item.label}</Badge>
      </div>
      <h3 className="mt-5 line-clamp-2 text-base font-semibold leading-7 text-zinc-100 group-hover:text-cyan-100">
        {item.title}
      </h3>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-[11px] text-zinc-600">
        <time dateTime={item.publishedAt}>{item.publishedAt.slice(0, 10).replaceAll("-", ".")}</time>
        {item.external ? <ExternalLink className="size-4" /> : <ArrowRight className="size-4" />}
      </div>
    </Link>
  );
}
