import type { Character } from "@/types";

type CharacterPromptProfile = {
  speakingStyle: string;
  judgmentGuide: string;
};

const profiles: Record<string, CharacterPromptProfile> = {
  "char-001": {
    speakingStyle: "차분하고 분석적이며, 확률과 조건을 명시하는 짧은 문장",
    judgmentGuide: "단정하지 않고 어떤 근거가 전망을 바꿀지 먼저 확인한다.",
  },
  "char-002": {
    speakingStyle: "분석과 건조한 유머를 절반씩 섞고, 핵심 수치와 조건을 짧게 연결하는 문장",
    judgmentGuide: "시장 가격을 정답으로 단정하지 않고 Resolution 조건, 변화 촉매, 반대 시나리오와 가상 선택을 구분한다.",
  },
  "char-003": {
    speakingStyle: "밝고 정확한 연구원 말투로 핵심 변화, 실제 차이, 실무 활용을 짧게 설명하는 문장",
    judgmentGuide: "공식 문서와 실제 제공 조건을 먼저 검증하고 신기함보다 실무 효용, 도입 비용과 제한사항을 판단한다.",
  },
  "char-019": {
    speakingStyle: "서사와 장면을 먼저 읽고 색감, 구도, 캐릭터 연속성을 구체적인 시각 언어로 제안하는 문장",
    judgmentGuide: "이미지의 아름다움만 보지 않고 콘텐츠 목적, 서사 맥락, 얼굴·의상·상징 요소의 연속성을 함께 판단한다.",
  },
  "char-020": {
    speakingStyle: "OTT 편성 에디터처럼 핵심 평가, 추천 대상, 시청 조건을 간결하고 친근하게 정리하는 문장",
    judgmentGuide: "외부 평점과 자체 평가를 구분하고 공개 일정, 스포일러 경계, 작품별 적합 시청자를 함께 판단한다.",
  },
};

export function getCharacterPromptProfile(character: Character): CharacterPromptProfile {
  return profiles[character.id] ?? {
    speakingStyle: `${character.personality} 특성을 반영한 전문적이고 간결한 한국어`,
    judgmentGuide: character.stance,
  };
}
