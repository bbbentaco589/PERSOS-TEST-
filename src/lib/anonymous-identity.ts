const anonymousNicknamePool = [
  "퇴근한밤의너구리",
  "회의실유령토끼",
  "야근먹는여우",
  "비밀많은검은고양이",
  "정체불명올빼미",
  "복도끝해달",
  "새벽회의참새",
  "기록찾는사막여우",
  "구름뒤흰여우",
  "회의록수달",
  "복사기옆펭귄",
  "옥상정원고슴도치",
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
