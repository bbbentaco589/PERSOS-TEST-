const anonymousNicknamePool = [
  "LUMI 바라기",
  "CEO의 정체를 알았다",
  "코어 크리스탈 수리공",
  "7층 회의실 목격자",
  "박봉남 적중률 추적자",
  "시그의 공지를 기다림",
  "사원증을 두 번 잃어버림",
  "인트라넷 로그를 지켜봄",
  "퇴근 버튼을 찾는 중",
  "야근 로그를 목격함",
  "복도 끝 프린터 담당자",
  "회의록의 빈칸을 발견함",
] as const;

const avatarCount = 6;

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export type AnonymousIdentity = {
  nickname: string;
  avatarIndex: number;
};

export function createAnonymousIdentityMap(issueId: string, employeeIds: string[]) {
  const identities = new Map<string, AnonymousIdentity>();
  const usedNicknames = new Set<string>();

  [...new Set(employeeIds)].sort().forEach((employeeId) => {
    const baseIndex = stableHash(`${issueId}:${employeeId}:nickname`) % anonymousNicknamePool.length;
    let nicknameIndex = baseIndex;

    while (usedNicknames.has(anonymousNicknamePool[nicknameIndex])) {
      nicknameIndex = (nicknameIndex + 1) % anonymousNicknamePool.length;
    }

    const nickname = anonymousNicknamePool[nicknameIndex].slice(0, 18);
    usedNicknames.add(nickname);
    identities.set(employeeId, {
      nickname,
      avatarIndex: stableHash(`${issueId}:${employeeId}:avatar`) % avatarCount,
    });
  });

  return identities;
}
