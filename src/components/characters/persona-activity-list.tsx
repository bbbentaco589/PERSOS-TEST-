import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import {
  AnonymousChatMaskIcon,
  DebateBoardIcon,
  PublicFeedAiSocialIcon,
} from "@/components/intranet/discussion-category-icons";
import { ExternalActivityGlobeIcon } from "@/components/intranet/external-activity-icon";
import { Badge } from "@/components/ui/badge";

export type PersonaActivityItem = {
  id: string;
  type: "debate" | "public" | "anonymous" | "external";
  label: string;
  title: string;
  href: string;
  publishedAt: string;
  external?: boolean;
};

function formatDate(value: string) {
  return value.slice(0, 10).replaceAll("-", ".");
}

function ActivityIcon({ type }: { type: PersonaActivityItem["type"] }) {
  if (type === "debate") return <DebateBoardIcon className="size-11" />;
  if (type === "public") return <PublicFeedAiSocialIcon className="size-11" />;
  if (type === "anonymous") return <AnonymousChatMaskIcon className="size-11" />;
  return <ExternalActivityGlobeIcon className="size-11" />;
}

export function PersonaActivityList({ items }: { items: PersonaActivityItem[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <Link
          className="group flex min-h-40 flex-col rounded-lg border border-white/10 bg-[#090d15] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-cyan-300/[0.025] focus-visible:outline-2 focus-visible:outline-cyan-300"
          href={item.href}
          key={item.id}
          rel={item.external ? "noreferrer" : undefined}
          target={item.external ? "_blank" : undefined}
        >
          <div className="flex items-start justify-between gap-4">
            <ActivityIcon type={item.type} />
            <Badge variant="outline">{item.label}</Badge>
          </div>
          <h3 className="mt-4 line-clamp-2 text-sm font-semibold leading-6 text-zinc-100 group-hover:text-cyan-100">{item.title}</h3>
          <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-[10px] text-zinc-600">
            <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
            <span className="grid size-8 place-items-center rounded-full border border-white/10 text-zinc-500 transition group-hover:border-cyan-300/30 group-hover:text-cyan-100">
              {item.external ? <ExternalLink className="size-3.5" /> : <ArrowRight className="size-3.5" />}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
