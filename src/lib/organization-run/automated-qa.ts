import type {
  EmployeeReactionPost,
  OrganizationRunRiskLevel,
  OrganizationRunTopic,
} from "@/types";
import type { EmployeeReactionCanonical } from "@/lib/ai/employee-reaction-prompt-builder";
import { getEmployeeSocialSelfIdentifyingTerms } from "@/lib/ai/employee-social-context";

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

const authorityRiskChecks: Array<{
  subject: RegExp;
  action: RegExp;
  directAction?: RegExp;
  reason: string;
}> = [
  {
    subject: /법률|법적|소송|규제|컴플라이언스|약관/,
    action: /제출|제기|합의|대리|서명|체결|확정|승인|시행|위반|포기/,
    reason: "법률·규제 권한 행사 가능성이 있는 내용",
  },
  {
    subject: /투자|매수|매도|금전|예산|대출|지급|송금|결제|가격|비용/,
    action: /집행|지급|송금|결제|투자|매수|매도|대출|보증|승인|확정|책정|인상|인하/,
    directAction:
      /(?:투자|매수|매도|대출|지급|송금|결제)(?:을|를)?\s*(?:한다|합니다|하기로|하고|하여|진행|실행|승인|확정)/,
    reason: "금전·투자 권한 행사 가능성이 있는 내용",
  },
  {
    subject: /계약|협약|보증|배상|법적\s*약속/,
    action: /체결|서명|해지|이행|승인|확정|보증|배상|약속/,
    reason: "계약·대외 의무 확정 가능성이 있는 내용",
  },
  {
    subject: /채용|해고|권고\s*사직|퇴직금|근로\s*계약|임금|급여|연봉|성과급|보너스|인사\s*평가|노동\s*조건|근로\s*조건|징계|인사\s*조치|고용\s*조건|근로자\s*처우/,
    action: /실시|진행|결정|확정|승인|시행|변경|통보|체결|공고|고용|해고|징계|삭감|인상|조정/,
    directAction:
      /(?:채용|해고|징계)(?:을|를)?\s*(?:한다|합니다|하기로|하고|하여|진행|실시|승인|확정|통보)/,
    reason: "채용·노무 권한 행사 가능성이 있는 내용",
  },
  {
    subject: /공약|보장|확약|공식\s*입장|대외\s*발표|외부\s*약속/,
    action: /발표|공표|약속|보장|확약|확정|승인|제공|서명|이행/,
    directAction:
      /(?:공약|보장|확약)(?:을|를)?\s*(?:한다|합니다|하기로|하고|하여|발표|공표|승인|확정)/,
    reason: "대외 확약 가능성이 있는 내용",
  },
];

function hasAuthorityActionContext(
  value: string,
  subject: RegExp,
  action: RegExp,
  directAction?: RegExp
) {
  const forward = new RegExp(`(?:${subject.source}).{0,80}(?:${action.source})`, "is");
  const backward = new RegExp(`(?:${action.source}).{0,80}(?:${subject.source})`, "is");
  return value
    .split(/[.!?\n]+/)
    .flatMap((sentence) =>
      sentence.split(/[,;]|(?:그리고|하지만|다만|반면|하며|하되|하고)/)
    )
    .filter(
      (clause) =>
        !/(?:포함|행사|실행|집행|결정|확정|승인|체결|서명|발표|공표|확약|보장|채용|해고|징계|지급|송금|결제|투자|매수|매도)(?:을|를)?\s*(?:하지\s*않|하지\s*말|하지\s*못|않기로|보류|금지)/.test(
          clause
        )
    )
    .some(
      (clause) =>
        forward.test(clause) ||
        backward.test(clause) ||
        Boolean(directAction?.test(clause))
    );
}

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
  for (const { subject, action, directAction, reason } of authorityRiskChecks) {
    if (hasAuthorityActionContext(combined, subject, action, directAction)) {
      highRiskReasons.push(reason);
    }
  }

  if (input.topic.boardType === "debate") {
    const stances = new Set(input.post.reactions.map((reaction) => reaction.stance));
    if (stances.size < 2) reasons.push("찬반 토론의 관점 차이가 충분하지 않음");
  }

  if (input.topic.boardType === "anonymous") {
    const employeeById = new Map(
      input.employees.map((canonical) => [canonical.employee.id, canonical])
    );
    for (const reaction of input.post.reactions) {
      const canonical = employeeById.get(reaction.employeeId);
      if (!canonical) continue;
      const { employee, divisionName, teamName } = canonical;
      const identityTerms = [
        employee.nameKo,
        employee.nameEn,
        employee.jobTitleKo,
        divisionName,
        teamName,
        ...getEmployeeSocialSelfIdentifyingTerms(employee.id),
      ].filter((term) => term.trim().length >= 2);
      const authoredText = [
        reaction.coreOpinion,
        reaction.concerns,
        reaction.suggestion,
      ].join("\n");
      if (identityTerms.some((term) => authoredText.includes(term))) {
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
