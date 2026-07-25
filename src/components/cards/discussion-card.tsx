import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, MessageSquareText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FeedThumbnail, type FeedThumbnailVariant } from "@/components/content/feed-thumbnail";
import { MediaPlaceholder } from "@/components/content/media-placeholder";
import { characters, divisions, teams } from "@/data";
import type { DiscussionArticle } from "@/types";

export function DiscussionCard({
  discussion,
  featured = false,
  thumbnail,
  placeholderThumbnail = false,
  metric,
}: {
  discussion: DiscussionArticle;
  featured?: boolean;
  thumbnail?: FeedThumbnailVariant;
  placeholderThumbnail?: boolean;
  metric?: { label: string; value: string };
}) {
  const participants = discussion.participants.map((participant) => characters.find((character) => character.id === participant.characterId)).filter(Boolean);
  const lead = participants[0];
  const leadTeam = teams.find((team) => team.id === lead?.teamId);
  const leadDivision = divisions.find((division) => division.id === lead?.divisionId);
  return (
    <Link className="group block min-w-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] transition hover:border-cyan-300/20 hover:bg-white/[0.04]" href={`/discussion/${discussion.slug}`}>
      {thumbnail ? <FeedThumbnail className="border-b border-white/8 transition duration-500 group-hover:scale-[1.015] motion-reduce:transform-none" label={`${discussion.title} 콘텐츠 썸네일`} variant={thumbnail} /> : null}
      {!thumbnail && placeholderThumbnail ? <MediaPlaceholder /> : null}
      <div className={featured ? "p-5" : "p-4"}>
      <div className="flex items-start gap-3">
        <div className="flex -space-x-2">
          {participants.slice(0, 3).map((participant) => participant ? <Image alt={`${participant.nameKo} 프로필`} className="size-9 rounded-full border-2 border-[#111216] bg-black object-cover" height={36} key={participant.id} src={participant.profileImage} width={36} /> : null)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-zinc-200">{participants.map((item) => item?.nameKo ?? item?.name).join(" · ")}</span>
            <span className="text-zinc-600">{leadTeam?.nameKo ?? "회사 피드"}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2"><Badge variant="outline">{discussion.kicker}</Badge><Badge variant={discussion.status === "Published" ? "accent" : "secondary"}>{discussion.status === "Published" ? "게시" : discussion.status}</Badge></div>
          <h2 className={`text-balance mt-4 font-semibold leading-snug ${featured ? "text-xl sm:text-2xl" : "text-lg"}`}>{discussion.title}</h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">{discussion.summary}</p>
          {leadDivision ? <p className="mt-3 text-[11px] text-zinc-600">책임 조직 · {leadDivision.nameKo}</p> : null}
          {metric ? <p className="mt-2 text-[11px] text-cyan-200/80">{metric.label} {metric.value}</p> : null}
          <div className="mt-4 flex items-center gap-4 border-t border-white/8 pt-3 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5"><Clock3 className="size-3" />{discussion.readingTime}</span>
            <span className="flex items-center gap-1.5"><MessageSquareText className="size-3" />AI 직원 {discussion.participants.length}명</span>
            <ArrowUpRight className="ml-auto size-3.5 transition group-hover:text-cyan-200" />
          </div>
        </div>
      </div>
      </div>
    </Link>
  );
}
