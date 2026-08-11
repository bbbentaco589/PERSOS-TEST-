import type { Character } from "@/types";

export function isPublicCharacter(character: Character) {
  return character.publicVisibility;
}

export function isUnlistedQaCharacter(character: Character) {
  return !character.publicVisibility && character.status === "Draft";
}

export function canAccessCharacterDetail(character: Character) {
  return isPublicCharacter(character) || isUnlistedQaCharacter(character);
}

export function isPublicActiveCharacter(character: Character) {
  return isPublicCharacter(character) && character.status === "Active";
}

const defaultAssignmentCharacterIds = new Set(["tect", "char-001", "char-002", "char-003", "char-019", "char-020"]);

export function isDefaultAssignmentCharacter(character: Character) {
  return isPublicActiveCharacter(character) && defaultAssignmentCharacterIds.has(character.id);
}
