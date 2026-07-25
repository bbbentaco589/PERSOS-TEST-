import {
  aiResponses,
  characters,
  companies,
  consensuses,
  contentDrafts,
  crossRebuttals,
  discussions,
  divisions,
  employeeShowcases,
  employees,
  knowledgeEntries,
  publishedContents,
  sources,
  teams,
  topics,
} from "@/data";
import {
  clearStoredDiscussions,
  deleteStoredDiscussion,
  getStoredDiscussionById,
  listStoredDiscussionFlows,
  listStoredDiscussions,
  saveDiscussionFlow,
  updateStoredDiscussionContentDraftStatus,
} from "@/lib/mock-store/discussions.store";
import type {
  AIResponsesRepository,
  CharactersRepository,
  ConsensusRepository,
  ContentDraftsRepository,
  CrossRebuttalsRepository,
  DiscussionPersistenceRepository,
  DiscussionsRepository,
  KnowledgeEntriesRepository,
  OrganizationRepository,
  SourcesRepository,
  TopicsRepository,
  UpdateDiscussionReviewStatusInput,
} from "@/lib/repositories/interfaces";
import type {
  DiscussionEngineFlowPayload,
} from "@/types/api";

export class MockCharactersRepository implements CharactersRepository {
  async listCharacters() {
    return characters;
  }

  async getCharacterById(characterId: string) {
    return characters.find((character) => character.id === characterId);
  }

  async getCharacterBySlug(slug: string) {
    return characters.find((character) => character.slug === slug);
  }

  async getCharactersByDepartmentId(departmentId: string) {
    return characters.filter((character) => character.departmentId === departmentId);
  }
}

export class MockOrganizationRepository implements OrganizationRepository {
  async listCompanies() {
    return companies;
  }

  async getCompanyById(companyId: string) {
    return companies.find((company) => company.id === companyId);
  }

  async listDivisions() {
    return [...divisions].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getDivisionById(divisionId: string) {
    return divisions.find((division) => division.id === divisionId);
  }

  async getDivisionBySlug(slug: string) {
    return divisions.find((division) => division.slug === slug);
  }

  async getDivisionsByCompanyId(companyId: string) {
    return divisions
      .filter((division) => division.companyId === companyId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async listTeams() {
    return [...teams].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getTeamById(teamId: string) {
    return teams.find((team) => team.id === teamId);
  }

  async getTeamBySlug(slug: string) {
    return teams.find((team) => team.slug === slug);
  }

  async getTeamsByDivisionId(divisionId: string) {
    return teams
      .filter((team) => team.divisionId === divisionId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async listEmployees() {
    return employees;
  }

  async getEmployeeById(employeeId: string) {
    return employees.find((employee) => employee.id === employeeId);
  }

  async getEmployeeBySlug(slug: string) {
    return employees.find((employee) => employee.slug === slug);
  }

  async getEmployeesByDivisionId(divisionId: string) {
    return employees.filter((employee) => employee.divisionId === divisionId);
  }

  async getEmployeesByTeamId(teamId: string) {
    return employees.filter((employee) => employee.teamId === teamId);
  }

  async listEmployeeShowcases() {
    return employeeShowcases;
  }

  async getEmployeeShowcaseByEmployeeId(employeeId: string) {
    return employeeShowcases.find((showcase) => showcase.employeeId === employeeId);
  }
}

export class MockTopicsRepository implements TopicsRepository {
  async listTopics() {
    return topics;
  }

  async getTopicById(topicId: string) {
    return topics.find((topic) => topic.id === topicId);
  }

  async getTopicBySlug(slug: string) {
    return topics.find((topic) => topic.slug === slug);
  }
}

export class MockSourcesRepository implements SourcesRepository {
  async listSources() {
    return sources;
  }

  async getSourceById(sourceId: string) {
    return sources.find((source) => source.id === sourceId);
  }

  async getSourcesByTopicId(topicId: string) {
    return sources.filter((source) => source.topicIds.includes(topicId));
  }

  async getSourcesByIds(sourceIds: string[]) {
    return sources.filter((source) => sourceIds.includes(source.id));
  }
}

export class MockDiscussionsRepository implements DiscussionsRepository {
  async listDiscussions() {
    return discussions;
  }

  async getDiscussionById(discussionId: string) {
    return discussions.find((discussion) => discussion.id === discussionId);
  }

  async getDiscussionBySlug(slug: string) {
    return discussions.find((discussion) => discussion.slug === slug);
  }

  async getDiscussionsByTopicId(topicId: string) {
    return discussions.filter((discussion) => discussion.topicId === topicId);
  }
}

export class MockAIResponsesRepository implements AIResponsesRepository {
  async listAIResponses() {
    return aiResponses;
  }

  async getResponsesByDiscussionId(discussionId: string) {
    return getStoredDiscussionById(discussionId)?.responses ??
      aiResponses.filter((response) => response.discussionId === discussionId);
  }
}

export class MockCrossRebuttalsRepository implements CrossRebuttalsRepository {
  async listCrossRebuttals() {
    return crossRebuttals;
  }

  async getCrossRebuttalsByDiscussionId(discussionId: string) {
    return getStoredDiscussionById(discussionId)?.rebuttals ??
      crossRebuttals.filter((rebuttal) => rebuttal.discussionId === discussionId);
  }
}

export class MockConsensusRepository implements ConsensusRepository {
  async listConsensus() {
    return consensuses;
  }

  async getConsensusByDiscussionId(discussionId: string) {
    return getStoredDiscussionById(discussionId)?.consensus ??
      consensuses.find((consensus) => consensus.discussionId === discussionId);
  }
}

export class MockContentDraftsRepository implements ContentDraftsRepository {
  async listContentDrafts() {
    return contentDrafts;
  }

  async getContentDraftById(contentDraftId: string) {
    return contentDrafts.find((contentDraft) => contentDraft.id === contentDraftId);
  }

  async getContentDraftsByDiscussionId(discussionId: string) {
    const storedDraft = getStoredDiscussionById(discussionId)?.contentDraft;

    if (storedDraft) {
      return [storedDraft];
    }

    return contentDrafts.filter((contentDraft) => contentDraft.discussionId === discussionId);
  }

  async listPublishedContent() {
    const generated = listStoredDiscussionFlows().flatMap((flow) => {
      if (!flow.contentDraft || flow.contentDraft.status !== "Published") return [];
      return [{
        ...flow.contentDraft,
        publishedAt: flow.discussion.publishedAt ?? flow.updatedAt,
        publicUrl: `/discussion/${flow.contentDraft.slug}`,
      }];
    });

    return [...generated, ...publishedContents];
  }

  async getPublishedContentBySlug(slug: string) {
    const generated = listStoredDiscussionFlows().find(
      (flow) => flow.contentDraft?.slug === slug && flow.contentDraft.status === "Published"
    );
    if (generated?.contentDraft) {
      return {
        ...generated.contentDraft,
        publishedAt: generated.discussion.publishedAt ?? generated.updatedAt,
        publicUrl: `/discussion/${generated.contentDraft.slug}`,
      };
    }
    return publishedContents.find((content) => content.slug === slug);
  }
}

export class MockKnowledgeEntriesRepository implements KnowledgeEntriesRepository {
  async listKnowledgeEntries() {
    return knowledgeEntries;
  }

  async getKnowledgeEntryById(knowledgeEntryId: string) {
    return knowledgeEntries.find((entry) => entry.id === knowledgeEntryId);
  }

  async getKnowledgeEntriesBySourceId(sourceId: string) {
    return knowledgeEntries.filter((entry) => entry.relatedSourceIds.includes(sourceId));
  }
}

export class MockDiscussionPersistenceRepository
  implements DiscussionPersistenceRepository
{
  async listGeneratedDiscussions() {
    return listStoredDiscussions();
  }

  async listGeneratedDiscussionFlows() {
    return listStoredDiscussionFlows();
  }

  async getGeneratedDiscussionFlowById(discussionId: string) {
    return getStoredDiscussionById(discussionId);
  }

  async saveDiscussionFlow(
    flow: DiscussionEngineFlowPayload,
    options?: { assignNewId?: boolean }
  ) {
    return saveDiscussionFlow(flow, options);
  }

  async updateReviewStatus(input: UpdateDiscussionReviewStatusInput) {
    return updateStoredDiscussionContentDraftStatus(input);
  }

  async deleteGeneratedDiscussion(discussionId: string) {
    return deleteStoredDiscussion(discussionId);
  }

  async clearGeneratedDiscussions() {
    clearStoredDiscussions();
  }
}
