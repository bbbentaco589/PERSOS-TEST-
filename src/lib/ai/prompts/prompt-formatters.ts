import type { Character, Source, Topic } from "@/types";
import { getCharacterPromptProfile } from "../character-prompt-profile";

export function formatTopic(topic: Topic) {
  return `논제 ID: ${topic.id}\n논제: ${topic.title}\n설명: ${topic.description}`;
}

export function formatSources(sources: Source[]) {
  if (sources.length === 0) {
    return "사용 가능한 출처가 없습니다. 출처를 추측하거나 허위 인용을 만들지 말고 sourceReferences는 빈 배열로 반환하세요.";
  }

  return sources.map((source) => [
    `출처 ID: ${source.id}`,
    `제목: ${source.name}`,
    `유형: ${source.type}`,
    `요약: ${source.summary}`,
    `용도: ${source.usage}`,
    `URL/참조: ${source.url ?? "내부 참조"}`,
  ].join("\n")).join("\n\n");
}

export function formatCharacter(character: Character) {
  const profile = getCharacterPromptProfile(character);
  return [
    `Character ID: ${character.id}`,
    `이름: ${character.nameKo}`,
    `직무: ${character.jobTitleKo}`,
    `부서: ${character.departmentId}`,
    `전문성: ${character.specialtiesKo.join(", ")}`,
    `성격: ${character.personality}`,
    `말투: ${profile.speakingStyle}`,
    `판단 기준: ${profile.judgmentGuide}`,
    `관점: ${character.stance}`,
  ].join("\n");
}
