import Image from "next/image";
import { AlertTriangle, CheckCircle2, MessageSquareText } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRepositories } from "@/lib/repositories";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  Draft: "초안",
  "Pending Review": "검토 대기",
  Approved: "승인",
  Published: "게시",
  Archived: "보관",
};

export default async function AdminConsensusReviewPage() {
  const repositories = getRepositories();
  const [seeded, generated] = await Promise.all([
    repositories.discussions.listDiscussions(),
    repositories.discussionPersistence.listGeneratedDiscussionFlows(),
  ]);
  const seededRecords = await Promise.all(seeded.map(async (discussion) => ({
    discussion,
    consensus: await repositories.consensus.getConsensusByDiscussionId(discussion.id),
    characters: await Promise.all(discussion.participants.map((participant) => repositories.characters.getCharacterById(participant.characterId))),
  })));
  const records = [
    ...generated.map((flow) => ({ discussion: flow.discussion, consensus: flow.consensus ?? undefined, characters: flow.characters })),
    ...seededRecords,
  ];

  return <AdminShell title="합의 검토" description="게시 전에 공통 결론, 남은 이견, 위험도와 사람 검토 준비 상태를 확인합니다."><div className="space-y-4">{records.map(({discussion, consensus, characters})=>{const members=characters.filter(Boolean);return <Card className="bg-white/[0.02]" key={discussion.id}><CardHeader className="border-b border-white/8"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{discussion.kicker}</Badge><Badge variant={discussion.status==="Published"?"accent":"secondary"}>{statusLabels[discussion.status] ?? discussion.status}</Badge><Badge variant="outline">위험도 {consensus?.riskLevel ?? "미평가"}</Badge></div><CardTitle className="mt-3 text-lg">{discussion.title}</CardTitle><div className="flex items-center gap-2">{members.map((character)=>character?<Image alt={`${character.nameKo} 프로필`} className="size-7 rounded-full border border-white/10 object-cover" height={28} key={character.id} src={character.profileImage} width={28}/>:null)}<p className="text-xs text-zinc-500">{members.map((character)=>character?.nameKo ?? character?.name).join(" · ")}</p></div></CardHeader><CardContent className="grid gap-5 pt-5 lg:grid-cols-[1.2fr_0.8fr]"><div><div className="flex items-center gap-2 text-xs font-medium text-cyan-100"><CheckCircle2 className="size-4"/>공통 결론</div><p className="mt-3 text-sm leading-7 text-zinc-300">{consensus?.summary ?? "생성된 합의가 없습니다."}</p><div className="mt-4 space-y-2">{consensus?.keyAgreements.slice(0,2).map((item)=><p className="flex gap-2 text-xs leading-5 text-zinc-500" key={item}><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-300"/>{item}</p>)}</div></div><div className="rounded-md border border-white/8 bg-black/20 p-4"><div className="flex items-center gap-2 text-xs font-medium"><AlertTriangle className="size-4 text-amber-300"/>남은 검토 항목</div><p className="mt-3 text-xs leading-5 text-zinc-500">{consensus?.openQuestions[0] ?? "기록된 미해결 질문이 없습니다."}</p><div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3"><span className="flex items-center gap-1.5 text-[11px] text-zinc-600"><MessageSquareText className="size-3"/>이견 {consensus?.disagreements.length ?? 0}개</span><Button disabled size="sm" variant="outline">검토 보기</Button></div></div></CardContent></Card>;})}</div></AdminShell>;
}
