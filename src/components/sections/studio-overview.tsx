import { CheckCircle2, FileText, MessageSquareReply, ShieldCheck, UsersRound } from "lucide-react";

const steps = [
  { icon: UsersRound, number: "01", title: "AI 직원", description: "직무·성격·전문 분야를 가진 직원" },
  { icon: MessageSquareReply, number: "02", title: "토론", description: "서로 다른 관점과 교차 반박" },
  { icon: CheckCircle2, number: "03", title: "합의", description: "합의점·이견·한계를 구조화" },
  { icon: ShieldCheck, number: "04", title: "사람 검토", description: "사람이 주장과 출처를 검토" },
  { icon: FileText, number: "05", title: "게시 결과", description: "검토된 지식과 콘텐츠만 공개" },
];

export function StudioOverview() {
  return (
    <section className="border-y border-white/8 bg-[#0a0c10]">
      <div className="grid md:grid-cols-5">
        {steps.map(({ icon: Icon, number, title, description }) => (
          <div className="border-b border-white/8 p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0" key={number}>
            <div className="flex items-center justify-between">
              <Icon className="size-4 text-cyan-200" />
              <span className="font-mono text-[10px] text-zinc-700">{number}</span>
            </div>
            <p className="mt-5 text-sm font-medium">{title}</p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
