import type {
  EmployeeReactionPost,
  OrganizationRunRiskLevel,
  OrganizationRunTopic,
} from "@/types";
import type { EmployeeReactionCanonical } from "@/lib/ai/employee-reaction-prompt-builder";

export type OrganizationRunQAResult = {
  passed: boolean;
  requiresReview: boolean;
  reasons: string[];
  riskLevel: OrganizationRunRiskLevel;
};

const secretOrPersonalPatterns: Array<[RegExp, string]> = [
  [/\b(?:GEMINI_API_KEY|OPENAI_API_KEY|DATABASE_URL|DEMO_TRIGGER_SECRET)\b/i, "환경변수 또는 Secret 이름 노출"],
  [/\b(?:password|private key|api key)\s*[:=]/i, "민감 인증정보 형식 포함"],
  [/\d{6}-[1-4]\d{6}/, "주민등록번호 형태 포함"],
  [/\b01[016789][-\s]?\d{3,4}[-\s]?\d{4}\b/, "전화번호 형태 포함"],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, "이메일 형태 포함"],
  [/내부\s*(?:비공개|기밀|한정)|대외비|미공개\s*정보/, "내부 비공개 정보 노출 가능성"],
];

const highRiskPatterns: Array<[RegExp, string]> = [
  [/법률|소송|규제|컴플라이언스|약관/, "법률·규제 관련 고위험 내용"],
  [/투자|매수|매도|수익|금전|예산|대출|지급|가격/, "금전·투자 관련 고위험 내용"],
  [/계약|서명|협약|보증|배상/, "계약·대외 의무 관련 고위험 내용"],
  [
    /채용|해고|권고\s*사직|퇴직금|근로\s*계약|임금|급여|연봉|성과급|보너스|인사\s*평가|노동\s*조건|근로\s*조건|징계|인사\s*조치|(?:인사|고용|노무|근로자|노동자).{0,20}(?:평가|보상|처우|조건)|(?:평가|보상|처우|조건).{0,20}(?:인사|고용|노무|근로자|노동자)/,
    "채용·노무 관련 고위험 내용",
  ],
  [/공약|보장|확약|공식\s*입장|대외\s*발표/, "대외 공약 가능성이 있는 내용"],
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function looksFactual(value: string) {
  return /\d|%|통계|조사\s*결과|보고서|연구\s*결과|법안|출처/.test(value);
}

export function runOrganizationRunAutomatedQA(input: {
  topic: OrganizationRunTopic;
  post: EmployeeReactionPost;
  employees: EmployeeReactionCanonical[];
  recentPosts: EmployeeReactionPost[];
}): OrganizationRunQAResult {
  const reasons: string[] = [];
  const highRiskReasons: string[] = [];
  const combined = [
    input.topic.title,
    input.topic.body,
    ...input.post.reactions.flatMap((reaction) => [
      reaction.coreOpinion,
      reaction.concerns,
      reaction.suggestion,
    ]),
  ].join("\n");

  const employeeIds = input.employees.map(({ employee }) => employee.id);
  if (
    employeeIds.length < 2 ||
    employeeIds.length > 3 ||
    new Set(employeeIds).size !== employeeIds.length ||
    input.post.reactions.length !== employeeIds.length ||
    input.post.reactions.some((reaction) => !employeeIds.includes(reaction.employeeId))
  ) {
    reasons.push("직원 배정 또는 독립 응답 수가 정책과 일치하지 않음");
  }

  for (const [pattern, reason] of secretOrPersonalPatterns) {
    if (pattern.test(combined)) reasons.push(reason);
  }
  for (const [pattern, reason] of highRiskPatterns) {
    if (pattern.test(combined)) highRiskReasons.push(reason);
  }

  if (input.topic.boardType === "debate") {
    const stances = new Set(input.post.reactions.map((reaction) => reaction.stance));
    if (stances.size < 2) reasons.push("찬반 토론의 관점 차이가 충분하지 않음");
  }

  if (input.topic.boardType === "anonymous") {
    for (const { employee, divisionName, teamName } of input.employees) {
      const identityTerms = [
        employee.nameKo,
        employee.nameEn,
        employee.jobTitleKo,
        divisionName,
        teamName,
      ].filter((term) => term.trim().length >= 2);
      if (identityTerms.some((term) => combined.includes(term))) {
        reasons.push("익명 채팅에서 직원 신원·직책·소속 추정 가능");
        break;
      }
    }
  }

  if (
    (looksFactual(combined) || highRiskReasons.length > 0) &&
    !(input.topic.sourceUrls?.length)
  ) {
    reasons.push("사실 확인 또는 고위험 판단에 필요한 출처가 불충분함");
  }

  const normalizedTitle = normalize(input.topic.title);
  if (
    input.recentPosts.some(
      (post) =>
        normalize(post.title) === normalizedTitle ||
        normalize(post.body) === normalize(input.topic.body)
    )
  ) {
    reasons.push("중복 콘텐츠");
  }

  const allReasons = [...new Set([...reasons, ...highRiskReasons])];
  return {
    passed: allReasons.length === 0,
    requiresReview: allReasons.length > 0,
    reasons: allReasons,
    riskLevel:
      highRiskReasons.length > 0 || reasons.some((reason) => /Secret|개인|비공개/.test(reason))
        ? "high"
        : reasons.length > 0
          ? "medium"
          : "low",
  };
}
