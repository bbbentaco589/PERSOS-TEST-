import { getRepositories } from "./repository-factory";

export function getKnowledgeEntries() {
  return getRepositories().knowledgeEntries.listKnowledgeEntries();
}

export function getKnowledgeEntryById(knowledgeEntryId: string) {
  return getRepositories().knowledgeEntries.getKnowledgeEntryById(knowledgeEntryId);
}

export function getKnowledgeEntriesBySourceId(sourceId: string) {
  return getRepositories().knowledgeEntries.getKnowledgeEntriesBySourceId(sourceId);
}
