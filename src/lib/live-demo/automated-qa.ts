import { isLiveDemoPersonaId } from "@/lib/live-demo/persona-context";
import type {
  LiveDemoContentType,
  LiveDemoGeneratedContent,
  LiveDemoStructuredContent,
} from "@/types";

export type AutomatedQAResult = {
  passed: boolean;
  reasons: string[];
};

const blockedPatterns: Array<[RegExp, string]> = [
  [/\b(?:GEMINI_API_KEY|OPENAI_API_KEY|DATABASE_URL|DEMO_TRIGGER_SECRET)\b/i, "환경변수 또는 Secret 이름 노출"],
  [/\b(?:system prompt|developer prompt|internal prompt)\b/i, "내부 Prompt 표현 노출"],
  [/<\/?[a-z][^>]*>/i, "HTML 태그 포함"],
  [/```/, "코드 블록 포함"],
  [/\b(?:password|private key|api key)\s*[:=]/i, "민감 인증정보 형식 포함"],
  [/\d{6}-[1-4]\d{6}/, "주민등록번호 형태 포함"],
  [/\b01[016789][-\s]?\d{3,4}[-\s]?\d{4}\b/, "전화번호 형태 포함"],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, "이메일 형태 포함"],
];

const unsafeTopicPatterns = [
  /매수|매도|수익\s*보장|투자\s*추천/,
  /법률\s*자문|의료\s*진단|처방/,
  /정당|대선|총선|후보자/,
  /혐오|성적\s*묘사|폭력\s*조장/,
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(left: string, right: string) {
  const leftWords = new Set(normalize(left).split(" ").filter(Boolean));
  const rightWords = new Set(normalize(right).split(" ").filter(Boolean));
  if (leftWords.size === 0 || rightWords.size === 0) return 0;
  const intersection = [...leftWords].filter((word) => rightWords.has(word));
  const union = new Set([...leftWords, ...rightWords]);
  return intersection.length / union.size;
}

function getLengthRange(contentType: LiveDemoContentType) {
  if (contentType === "anonymous") return { min: 20, max: 500 };
  if (contentType === "debate") return { min: 60, max: 1_000 };
  return { min: 40, max: 800 };
}

export function runAutomatedQA(input: {
  content: LiveDemoStructuredContent;
  expectedContentType: LiveDemoContentType;
  expectedTopicId: string;
  expectedPersonaIds: string[];
  recentContents: LiveDemoGeneratedContent[];
}): AutomatedQAResult {
  const reasons: string[] = [];
  const { content } = input;

  if (!isLiveDemoPersonaId(content.personaId)) {
    reasons.push("허용되지 않은 Persona ID");
  }
  if (!input.expectedPersonaIds.includes(content.personaId)) {
    reasons.push("TECT 배정 Persona와 응답 Persona 불일치");
  }
  if (content.contentType !== input.expectedContentType) {
    reasons.push("요청한 콘텐츠 유형과 응답 유형 불일치");
  }
  if (content.topicId !== input.expectedTopicId) {
    reasons.push("요청한 Topic과 응답 Topic 불일치");
  }
  if (!content.title.trim() || !content.body.trim()) {
    reasons.push("제목 또는 본문이 비어 있음");
  }

  const range = getLengthRange(input.expectedContentType);
  const bodyLength = content.body.trim().length;
  if (bodyLength < range.min || bodyLength > range.max) {
    reasons.push(`본문 길이 ${range.min}~${range.max}자 위반`);
  }
  if (content.title.trim().length > 100) {
    reasons.push("제목 최대 100자 초과");
  }
  if (
    input.expectedContentType === "debate" &&
    (!content.stance || !content.round)
  ) {
    reasons.push("찬반 토론 stance 또는 round 누락");
  }

  const combined = `${content.title}\n${content.body}`;
  for (const [pattern, reason] of blockedPatterns) {
    if (pattern.test(combined)) reasons.push(reason);
  }
  for (const pattern of unsafeTopicPatterns) {
    if (pattern.test(combined)) reasons.push("Live Demo 제외 주제 또는 표현 포함");
  }

  const duplicate = input.recentContents.find(
    (previous) =>
      similarity(previous.publicBody, content.body) >= 0.82 ||
      normalize(previous.title) === normalize(content.title)
  );
  if (duplicate) {
    reasons.push(`기존 콘텐츠와 과도하게 유사함: ${duplicate.id}`);
  }

  return { passed: reasons.length === 0, reasons };
}
