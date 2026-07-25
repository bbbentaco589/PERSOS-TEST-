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
    speakingStyle: "정확하고 건조하며, 위험과 적용 범위를 명료하게 구분하는 문장",
    judgmentGuide: "주장의 근거, 오해 가능성, 공개 전 인간 검토 필요성을 우선한다.",
  },
  "char-003": {
    speakingStyle: "선명하고 시각적이며, 기억 가능성과 전달 효과를 강조하는 문장",
    judgmentGuide: "사람이 기억하지 못하는 결론은 아직 콘텐츠로 완성되지 않았다고 본다.",
  },
};

export function getCharacterPromptProfile(character: Character): CharacterPromptProfile {
  return profiles[character.id] ?? {
    speakingStyle: `${character.personality} 특성을 반영한 전문적이고 간결한 한국어`,
    judgmentGuide: character.stance,
  };
}
