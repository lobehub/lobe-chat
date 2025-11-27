import { UIChatMessage } from '@lobechat/types';
import type { RetrieveMemoryResult } from '@lobechat/types';

import { userMemoryService } from '@/services/userMemory';
import { getChatStoreState } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { getSessionStoreState } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import {
  getUserMemoryStoreState,
  useUserMemoryStore,
  userMemorySelectors,
} from '@/store/userMemory';
import { userMemoryCacheKey } from '@/store/userMemory/utils/cacheKey';
import { createMemorySearchParams } from '@/store/userMemory/utils/searchParams';

/**
 * User memories with fetch metadata
 */
export interface UserMemoriesResult {
  fetchedAt: number;
  memories: RetrieveMemoryResult;
}

/**
 * Context for resolving user memories
 */
export interface MemoryResolverContext {
  /** Whether memory plugin is enabled */
  isMemoryPluginEnabled: boolean;
  /** Chat messages for context extraction */
  messages: UIChatMessage[];
}

const EMPTY_MEMORIES: RetrieveMemoryResult = {
  contexts: [],
  experiences: [],
  preferences: [],
};

/**
 * Resolves user memories for context injection
 *
 * This function handles:
 * 1. Checking if memories are already cached
 * 2. Building memory context from messages and session
 * 3. Fetching memories from the service if not cached
 * 4. Caching the fetched memories for future use
 */
export const resolveUserMemories = async (
  ctx: MemoryResolverContext,
): Promise<UserMemoriesResult | undefined> => {
  const { isMemoryPluginEnabled, messages } = ctx;

  // Check if already have cached memories
  let userMemories =
    userMemorySelectors.activeUserMemories(isMemoryPluginEnabled)(getUserMemoryStoreState());

  if (userMemories) {
    return userMemories;
  }

  // If memory plugin not enabled, return undefined
  if (!isMemoryPluginEnabled) {
    return undefined;
  }

  // Build memory context from messages and session
  const chatStoreState = getChatStoreState();
  const sessionStoreState = getSessionStoreState();

  const historyMessages = messages.slice(0, -1);
  const latestHistoryMessage = [...historyMessages]
    .reverse()
    .find((item) => typeof item?.content === 'string' && item.content.trim().length > 0);
  const pendingMessage = messages.at(-1);

  const memoryContext = {
    latestMessageContent: latestHistoryMessage?.content,
    pendingMessageContent: pendingMessage?.content,
    session: sessionSelectors.currentSession(sessionStoreState),
    topic: topicSelectors.currentActiveTopic(chatStoreState),
  };

  // Set active memory context in store
  useUserMemoryStore.getState().setActiveMemoryContext(memoryContext);

  const updatedMemoryState = getUserMemoryStoreState();
  const memoryParams = updatedMemoryState.activeParams ?? createMemorySearchParams(memoryContext);

  if (!memoryParams) {
    return undefined;
  }

  const key = userMemoryCacheKey(memoryParams);
  const cachedMemories = updatedMemoryState.memoryMap[key];

  // Return cached memories if available
  if (cachedMemories) {
    const cachedAt = updatedMemoryState.memoryFetchedAtMap[key] ?? Date.now();
    return {
      fetchedAt: cachedAt,
      memories: cachedMemories,
    };
  }

  // Fetch memories from service
  const result = await userMemoryService.retrieveMemory(memoryParams);
  const memories = result ?? EMPTY_MEMORIES;
  const fetchedAt = Date.now();

  // Cache the fetched memories
  useUserMemoryStore.setState((state) => ({
    memoryFetchedAtMap: {
      ...state.memoryFetchedAtMap,
      [key]: fetchedAt,
    },
    memoryMap: {
      ...state.memoryMap,
      [key]: memories,
    },
  }));

  return {
    fetchedAt,
    memories,
  };
};
