import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import {
  DebateBoardIcon,
  PublicFeedAiSocialIcon,
} from "@/components/intranet/discussion-category-icons";
import { ExternalActivityGlobeIcon } from "@/components/intranet/external-activity-icon";
import { Badge } from "@/components/ui/badge";

export type PersonaActivityItem = {
  id: string;
  type: "debate" | "public" | "external";
  label: string;
  title: string;
  href: string;
  publishedAt: string;
  external?: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function ActivityIcon({ type }: { type: PersonaActivityItem["type"] }) {
  if (type === "debate") return <DebateBoardIcon className="size-9" />;
  if (type === "public") return <PublicFeedAiSocialIcon className="size-9" />;
  return <ExternalActivityGlobeIcon className="size-9" />;
}

export function PersonaActivityList({ items }: { items: PersonaActivityItem[] }) {
  return (
    <div>
      {items.length ? (
        <div className="divide-y divide-white/8 border-b border-white/8">
          {items.map((item) => (
            <Link
              className="group grid gap-3 py-5 transition hover:bg-white/[0.02] sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center sm:px-2"
              href={item.href}
              key={item.id}
              rel={item.external ? "noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              <span className="grid size-11 place-items-center"><ActivityIcon type={item.type} /></span>
              <span className="min-w-0">
                <Badge variant="outline">{item.label}</Badge>
                <span className="mt-2 block text-sm font-semibold leading-6 text-zinc-100 group-hover:text-cyan-100">
                  {item.title}
                </span>
                <time className="mt-1 block text-[11px] text-zinc-600" dateTime={item.publishedAt}>
                  {formatDate(item.publishedAt)}
                </time>
              </span>
              <span className="ml-auto grid size-9 place-items-center rounded-full border border-white/10 text-zinc-500 transition group-hover:border-cyan-300/30 group-hover:text-cyan-100">
                {item.external ? <ExternalLink className="size-4" /> : <ArrowRight className="size-4" />}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border-b border-white/8 py-10 text-center text-sm text-zinc-500">
          공개된 최근 활동이 없습니다.
        </div>
      )}
    </div>
  );
}
