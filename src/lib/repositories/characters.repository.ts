import { getRepositories } from "./repository-factory";

export function getAllCharacters() {
  return getRepositories().characters.listCharacters();
}

export function getCharacterById(characterId: string) {
  return getRepositories().characters.getCharacterById(characterId);
}

export function getCharacterBySlug(slug: string) {
  return getRepositories().characters.getCharacterBySlug(slug);
}

export function getCharactersByDepartmentId(departmentId: string) {
  return getRepositories().characters.getCharactersByDepartmentId(departmentId);
}
