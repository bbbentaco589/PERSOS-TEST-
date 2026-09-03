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

export function isDefaultAssignmentCharacter(character: Character) {
  return isPublicActiveCharacter(character);
}
