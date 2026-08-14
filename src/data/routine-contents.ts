export type RoutineContent = {
  employeeId: string;
  titleKo: string;
  titleEn: string;
  cadenceKo: string;
  overviewKo: string;
};

export const routineContents: RoutineContent[] = [
  {
    employeeId: "tect",
    titleKo: "텍트(TECT)의 AI 에이전트 조직 경영 노트",
    titleEn: "TECT AI Agent Organization Management Notes",
    cadenceKo: "주간",
    overviewKo:
      "최신 AI 에이전트 산업 변화와 실제 사례를 조직·직무·권한·평가·비용·책임의 문제로 해석하고, AI 직원을 실제로 운영하기 위한 경영 판단과 실행 기준을 기록합니다.",
  },
  {
    employeeId: "char-001",
    titleKo: "시그(SIG)의 현시각 경제 시그널",
    titleEn: "SIG Current Economic Signal",
    cadenceKo: "평일 데일리",
    overviewKo:
      "국내외 경제·금융·산업의 주요 변화를 점검해 오늘 사업과 시장을 이해하는 데 필요한 핵심 신호를 선별하고, 그 의미와 다음 관찰 지점을 해석합니다.",
  },
  {
    employeeId: "char-002",
    titleKo: "박봉남(Lo-Pay Park)의 예측시장 브리'픽'",
    titleEn: "Lo-Pay Park Prediction Market Bri'Pick'",
    cadenceKo: "데일리·이벤트 기반",
    overviewKo:
      "예측시장 가격이 암시하는 확률과 현실 발생 가능성 사이의 괴리를 분석하고, 촉매·반대 시나리오·무효화 조건과 박봉남의 자체 확률을 함께 제시합니다.",
  },
  {
    employeeId: "char-003",
    titleKo: "루미(LUMI)의 AI 툴 캐치업",
    titleEn: "LUMI AI Tool Catch-up",
    cadenceKo: "데일리",
    overviewKo:
      "최신 AI 서비스와 도구의 변화 중 지금 알아야 할 업데이트를 골라 사용 가능 조건, 실제 차이, 업무 활용법, 제한사항과 직접 써볼 가치를 검증합니다.",
  },
  {
    employeeId: "char-019",
    titleKo: "픽세르(PIXEUR)의 비쥬얼텔링",
    titleEn: "PIXEUR Visual Storytelling",
    cadenceKo: "데일리",
    overviewKo:
      "온라인에서 떠오른 하나의 주제를 사실과 맥락에 따라 선별하고, 사건의 관계·변화·감정·상징을 여러 장면이 이어지는 시각적 이야기로 재구성합니다.",
  },
  {
    employeeId: "char-020",
    titleKo: "오덕순(O-TTucksoon)의 OTT 스캐너",
    titleEn: "O-TTucksoon OTT Scanner",
    cadenceKo: "매주 월요일",
    overviewKo:
      "주요 OTT의 공개 예정작·신작·종료 예정작·화제작과 공개 평점을 스캔해, 스포일러 없이 한 주의 시청 우선순위와 오덕순의 픽을 정리합니다.",
  },
];

export function getRoutineContentByEmployeeId(employeeId: string) {
  return routineContents.find((routine) => routine.employeeId === employeeId);
}
