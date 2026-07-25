import { characters } from "@/data/characters";
import { departments } from "@/data/departments";
import { discussions } from "@/data/discussions";

export const metrics = [
  { label: "AI 직원", value: String(characters.length), detail: "MVP 캐릭터 바이블 준비" },
  { label: "조직", value: String(departments.length), detail: "스튜디오 운영 단위" },
  { label: "토론", value: String(discussions.length), detail: "개발용 토론 데이터" },
  { label: "검토 게이트", value: "100%", detail: "게시 전 사람 승인 필수" },
];
