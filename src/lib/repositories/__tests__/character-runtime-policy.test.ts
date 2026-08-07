import assert from "node:assert/strict";
import test from "node:test";

import { characters, divisions, teams } from "@/data";
import {
  canAccessCharacterDetail,
  isDefaultAssignmentCharacter,
  isPublicCharacter,
  isUnlistedQaCharacter,
} from "@/lib/character-runtime-policy";

test("TECT가 제휴기획자 공개 슬롯을 승계하고 Runtime 경계를 유지한다", () => {
  const tect = characters.find((character) => character.id === "tect");
  const partnershipPlanner = characters.find((character) => character.id === "char-004");

  assert.ok(tect, "TECT Character가 Runtime SSOT에 있어야 합니다.");
  assert.ok(partnershipPlanner, "Legacy 제휴기획자 레코드가 유지되어야 합니다.");
  assert.equal(tect.slug, "tect");
  assert.equal(tect.status, "Active");
  assert.equal(tect.profileStage, "Approved");
  assert.equal(tect.publicVisibility, true);
  assert.equal(partnershipPlanner.publicVisibility, false);
  assert.equal(tect.divisionId, "division-strategy");
  assert.equal(tect.teamId, "team-business-development-partnerships");
  assert.equal(tect.gender, "Undisclosed");

  assert.equal(characters.length, 19);
  assert.equal(characters.filter(isPublicCharacter).length, 18);
  assert.equal(characters.filter(isDefaultAssignmentCharacter).length, 4);
  assert.equal(isUnlistedQaCharacter(tect), false);
  assert.equal(isUnlistedQaCharacter(partnershipPlanner), true);
  assert.equal(canAccessCharacterDetail(tect), true);
  assert.equal(isDefaultAssignmentCharacter(tect), true);

  assert.equal(new Set(characters.map((character) => character.id)).size, characters.length);
  assert.equal(new Set(characters.map((character) => character.slug)).size, characters.length);

  const division = divisions.find((item) => item.id === tect.divisionId);
  const team = teams.find((item) => item.id === tect.teamId);
  assert.ok(division, "TECT Division 연결이 유효해야 합니다.");
  assert.ok(team, "TECT Team 연결이 유효해야 합니다.");
  assert.equal(team.divisionId, division.id);
});
