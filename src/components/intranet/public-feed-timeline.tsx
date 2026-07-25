import { Heart, MessageCircleReply, Quote, Share2 } from "lucide-react";

import { EmployeeAuthorMeta } from "@/components/intranet/employee-author-meta";
import { Badge } from "@/components/ui/badge";
import { divisions, employees } from "@/data";
import type { PublicDiscussionDetail } from "@/lib/public-discussions";

function formatStoredDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function ReadOnlyActions() {
  const actions = [
    { icon: Heart, label: "공감" },
    { icon: MessageCircleReply, label: "반론" },
    { icon: Quote, label: "인용" },
    { icon: Share2, label: "공유" },
  ];

  return (
    <div aria-label="읽기 전용 반응 지표" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/8 pt-3">
      {actions.map(({ icon: Icon, label }) => (
        <span className="flex items-center gap-1.5 text-[10px] text-zinc-600" key={label} title="현재 집계 기능은 연결되지 않았습니다">
          <Icon className="size-3.5" />{label}<span className="text-zinc-700">집계 전</span>
        </span>
      ))}
    </div>
  );
}

export function PublicFeedTimeline({ detail }: { detail: PublicDiscussionDetail }) {
  const { consensus, discussion, responses, rebuttals } = detail;
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));

  return (
    <>
      <section aria-labelledby="public-timeline-title">
        <div className="border-b border-white/8 pb-5">
          <p className="text-[10px] font-semibold uppercase text-cyan-300">Employee Timeline</p>
          <h2 className="mt-2 text-2xl font-semibold" id="public-timeline-title">실명 공개 타임라인</h2>
          <p className="mt-2 text-sm text-zinc-500">저장된 초기 의견과 교차 반박을 시간순 구조로 보여줍니다.</p>
        </div>

        <div className="divide-y divide-white/8 border-b border-white/8">
          {responses.map((response) => {
            const employee = employeeById.get(response.characterId);
            if (!employee) return null;
            const responseRebuttals = rebuttals.filter((item) => item.targetResponseId === response.id);

            return (
              <article className="py-6" key={response.id}>
                <div className="flex items-start justify-between gap-3">
                  <EmployeeAuthorMeta employee={employee} timestamp={formatStoredDate(response.createdAt)} />
                  <Badge className="shrink-0" variant="accent">1차 의견</Badge>
                </div>
                <div className="mt-4 pl-[52px]">
                  <p className="text-sm font-medium leading-6 text-zinc-200">{response.stance}</p>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">{response.content}</p>
                  <ReadOnlyActions />

                  {responseRebuttals.length ? (
                    <div className="mt-5 space-y-5 border-l border-cyan-300/20 pl-4 sm:ml-3 sm:pl-5">
                      {responseRebuttals.map((rebuttal) => {
                        const rebuttalEmployee = employeeById.get(rebuttal.fromCharacterId);
                        if (!rebuttalEmployee) return null;
                        return (
                          <div key={rebuttal.id}>
                            <div className="flex items-start justify-between gap-3">
                              <EmployeeAuthorMeta employee={rebuttalEmployee} timestamp={formatStoredDate(rebuttal.createdAt)} />
                              <Badge className="shrink-0" variant="outline">반론</Badge>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-zinc-400 sm:pl-[52px]">{rebuttal.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="consensus-summary-title" className="border-y border-cyan-300/20 bg-cyan-300/[0.035] px-5 py-7 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase text-cyan-300">Consensus & Human Review</p>
            <h2 className="mt-2 text-2xl font-semibold" id="consensus-summary-title">통합 결과</h2>
          </div>
          <Badge variant="accent">사람 검토 · {detail.contentDraft.status}</Badge>
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-300">{consensus.summary}</p>

        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold text-zinc-200">주요 합의</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
              {consensus.keyAgreements.map((item) => <li className="border-l border-emerald-300/30 pl-3" key={item}>{item}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-200">남은 쟁점</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
              {[...consensus.disagreements, ...consensus.openQuestions].map((item) => <li className="border-l border-amber-300/30 pl-3" key={item}>{item}</li>)}
            </ul>
          </div>
        </div>

        <div className="mt-7 border-t border-white/8 pt-5">
          <h3 className="text-xs font-semibold text-zinc-200">사업부별 관점 차이</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {responses.map((response) => {
              const employee = employeeById.get(response.characterId);
              const division = divisions.find((item) => item.id === employee?.divisionId);
              return employee && division ? (
                <div className="border-l border-white/10 pl-3" key={response.id}>
                  <p className="text-[10px] text-cyan-200">{division.nameKo}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{response.stance}</p>
                </div>
              ) : null;
            })}
          </div>
        </div>

        <p className="mt-6 text-[10px] text-zinc-600">최종 공개일 {discussion.publishedAt ?? "미정"}</p>
      </section>
    </>
  );
}
