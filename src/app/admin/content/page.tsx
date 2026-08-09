import Link from "next/link";
import { ArrowUpRight, Database, FileSearch, MessagesSquare } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { LobbyEventManager } from "@/components/admin/lobby-event-manager";
import {
  IntegrationBadge,
  OperationsTable,
} from "@/components/admin/operations-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { discussions, knowledgeEntries, sources, topics } from "@/data";
import {
  isLobbyEventStoreConfigured,
  listLobbyEventBanners,
} from "@/lib/lobby-event-store";

export const dynamic = "force-dynamic";

const modules = [
  "Event Banner",
  "Topic",
  "Source",
  "Feed Activity",
  "Discussion",
  "Consensus",
  "Knowledge",
  "Content Output",
];

export default async function AdminContentPage() {
  const lobbyEventBanners = await listLobbyEventBanners({
    includeInactive: true,
  });
  const rows = topics.map((topic) => ({
    id: topic.id,
    cells: [
      <div key="topic">
        <p className="font-medium text-zinc-200">{topic.title}</p>
        <p className="mt-1 text-[10px] text-zinc-600">{topic.sourceHint}</p>
      </div>,
      <Badge key="status" variant="outline">
        {topic.status}
      </Badge>,
      topic.priority,
      `${sources.filter((source) => source.topicIds.includes(topic.id)).length}개`,
      <Button asChild key="action" size="sm" variant="outline">
        <Link href="/admin/discussion-generator">
          열기
          <ArrowUpRight />
        </Link>
      </Button>,
    ],
  }));

  return (
    <AdminShell
      description="로비 이벤트 배너, Topic, Source, Feed Activity, Discussion, Consensus, Knowledge와 Content Output을 하나의 작업 공간에서 관리합니다."
      title="콘텐츠 워크벤치"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <IntegrationBadge state="Mock" />
          <Badge variant="outline">Discussion {discussions.length}</Badge>
          <Badge variant="outline">Knowledge {knowledgeEntries.length}</Badge>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/discussion-generator">
            Mock Discussion 생성
            <ArrowUpRight />
          </Link>
        </Button>
      </div>

      <nav
        aria-label="워크벤치 모듈"
        className="flex gap-1 overflow-x-auto border-b border-white/8 pb-2"
      >
        {modules.map((module, index) => (
          <span
            className={
              index === 0
                ? "shrink-0 rounded-md bg-white/8 px-3 py-2 text-xs text-white"
                : "shrink-0 rounded-md px-3 py-2 text-xs text-zinc-500"
            }
            key={module}
          >
            {module}
          </span>
        ))}
      </nav>

      <LobbyEventManager
        initialBanners={lobbyEventBanners}
        storageConfigured={isLobbyEventStoreConfigured()}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 border border-white/8 p-4">
          <Database className="size-4 text-cyan-200" />
          <div>
            <p className="text-lg font-semibold">{topics.length}</p>
            <p className="text-[10px] text-zinc-600">Topic</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border border-white/8 p-4">
          <FileSearch className="size-4 text-violet-300" />
          <div>
            <p className="text-lg font-semibold">{sources.length}</p>
            <p className="text-[10px] text-zinc-600">Source</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border border-white/8 p-4">
          <MessagesSquare className="size-4 text-emerald-300" />
          <div>
            <p className="text-lg font-semibold">{discussions.length}</p>
            <p className="text-[10px] text-zinc-600">Discussion</p>
          </div>
        </div>
      </div>

      <OperationsTable
        columns={["Topic", "상태", "우선순위", "출처", "작업"]}
        empty="등록된 Topic이 없습니다."
        rows={rows}
      />
      <p className="text-[11px] leading-5 text-zinc-600">
        로비 배너는 Upstash KV에 최대 5개까지 저장합니다. 기존 Topic·Source·Discussion Generator·Consensus·Knowledge 화면은 데이터 흐름 보존을 위해 Legacy Route로 유지합니다.
      </p>
    </AdminShell>
  );
}
