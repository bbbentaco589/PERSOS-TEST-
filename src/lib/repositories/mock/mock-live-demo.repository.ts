import type { LiveDemoRepository } from "@/lib/repositories/interfaces";
import type {
  LiveDemoContentPlan,
  LiveDemoGeneratedContent,
  LiveDemoGenerationRun,
  LiveDemoRepositoryFilter,
  LiveDemoState,
  LiveDemoUsageLog,
} from "@/types";

type MockLiveDemoStore = {
  plan?: LiveDemoContentPlan;
  contents: Map<string, LiveDemoGeneratedContent>;
  runs: Map<string, LiveDemoGenerationRun>;
  usageLogs: LiveDemoUsageLog[];
  state: LiveDemoState;
};

const globalStore = globalThis as typeof globalThis & {
  __persosLiveDemoStore?: MockLiveDemoStore;
};

const store: MockLiveDemoStore =
  globalStore.__persosLiveDemoStore ??
  (globalStore.__persosLiveDemoStore = {
    plan: undefined,
    contents: new Map<string, LiveDemoGeneratedContent>(),
    runs: new Map<string, LiveDemoGenerationRun>(),
    usageLogs: [] as LiveDemoUsageLog[],
    state: {
      id: "investor-live-demo",
      killSwitch: false,
      totalCalls: 0,
      chatRuns: 0,
      chatMessages: 0,
      feedPosts: 0,
      debateMessages: 0,
      updatedAt: new Date().toISOString(),
    },
  });

export function resetMockLiveDemoStore() {
  store.plan = undefined;
  store.contents.clear();
  store.runs.clear();
  store.usageLogs.length = 0;
  store.state = {
    id: "investor-live-demo",
    killSwitch: false,
    totalCalls: 0,
    chatRuns: 0,
    chatMessages: 0,
    feedPosts: 0,
    debateMessages: 0,
    updatedAt: new Date().toISOString(),
  };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class MockLiveDemoRepository implements LiveDemoRepository {
  async getActivePlan() {
    return store.plan?.status === "active" ? clone(store.plan) : undefined;
  }

  async savePlan(plan: LiveDemoContentPlan) {
    store.plan = clone(plan);
    return clone(plan);
  }

  async listGeneratedContents(filter: LiveDemoRepositoryFilter = {}) {
    const contents = [...store.contents.values()]
      .filter(
        (content) =>
          (!filter.contentType || content.contentType === filter.contentType) &&
          (!filter.status || content.status === filter.status)
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return clone(
      typeof filter.limit === "number"
        ? contents.slice(0, filter.limit)
        : contents
    );
  }

  async getGeneratedContentById(contentId: string) {
    const content = store.contents.get(contentId);
    return content ? clone(content) : undefined;
  }

  async saveGeneratedContent(content: LiveDemoGeneratedContent) {
    store.contents.set(content.id, clone(content));
    return clone(content);
  }

  async updateGeneratedContent(content: LiveDemoGeneratedContent) {
    store.contents.set(content.id, clone(content));
    return clone(content);
  }

  async createGenerationRun(run: LiveDemoGenerationRun) {
    store.runs.set(run.id, clone(run));
    return clone(run);
  }

  async updateGenerationRun(run: LiveDemoGenerationRun) {
    store.runs.set(run.id, clone(run));
    return clone(run);
  }

  async saveUsageLog(log: LiveDemoUsageLog) {
    store.usageLogs.push(clone(log));
    return clone(log);
  }

  async listUsageLogs() {
    return clone(
      [...store.usageLogs].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      )
    );
  }

  async getState() {
    return clone(store.state);
  }

  async setKillSwitch(enabled: boolean) {
    store.state = {
      ...store.state,
      killSwitch: enabled,
      updatedAt: new Date().toISOString(),
    };
    return clone(store.state);
  }

  async reserveGenerationCall(maxTotalCalls: number) {
    if (
      store.state.killSwitch ||
      store.state.totalCalls >= maxTotalCalls
    ) {
      return null;
    }
    store.state = {
      ...store.state,
      totalCalls: store.state.totalCalls + 1,
      updatedAt: new Date().toISOString(),
    };
    return clone(store.state);
  }

  async incrementCounters(
    delta: Parameters<LiveDemoRepository["incrementCounters"]>[0]
  ) {
    store.state = {
      ...store.state,
      chatRuns: store.state.chatRuns + (delta.chatRuns ?? 0),
      chatMessages: store.state.chatMessages + (delta.chatMessages ?? 0),
      feedPosts: store.state.feedPosts + (delta.feedPosts ?? 0),
      debateMessages:
        store.state.debateMessages + (delta.debateMessages ?? 0),
      updatedAt: new Date().toISOString(),
    };
    return clone(store.state);
  }
}
