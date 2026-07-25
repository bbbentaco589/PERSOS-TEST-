import Link from "next/link";
import { ArrowUpRight, BookOpenText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FeedThumbnail } from "@/components/content/feed-thumbnail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KnowledgeEntry } from "@/types";

export function KnowledgeCard({ entry, author }: { entry: KnowledgeEntry; author?: { name: string; team: string; division: string } }) {
  return (
    <Card className="group overflow-hidden bg-white/[0.025] transition hover:border-white/20">
      <FeedThumbnail label={`${entry.title} 지식 썸네일`} variant="knowledge" />
      <CardHeader>
        <div className="flex items-center gap-3">
          <BookOpenText className="size-4 text-cyan-200" />
          <Badge variant="outline">{entry.category}</Badge>
        </div>
        <div className="flex items-start justify-between gap-3"><CardTitle className="mt-3"><Link className="transition hover:text-cyan-200" href={`/knowledge/${entry.slug}`}>{entry.title}</Link></CardTitle><ArrowUpRight className="mt-3 size-4 text-zinc-600 group-hover:text-white" /></div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{entry.summary}</p>
        {author ? <div className="mt-4 border-l-2 border-cyan-300/30 pl-3 text-[11px] leading-5 text-zinc-500"><p className="text-zinc-300">{author.name} · {author.team}</p><p>{author.division}</p></div> : null}
        <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-xs text-muted-foreground">
          <span>{entry.sourceType}</span>
          <span>신뢰도 {entry.confidence === "High" ? "높음" : entry.confidence === "Medium" ? "보통" : "낮음"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
