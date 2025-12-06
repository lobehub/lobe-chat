import { and, desc, eq, inArray } from 'drizzle-orm';

import {
  UserMemoryContextsWithoutVectors,
  UserMemoryExperiencesWithoutVectors,
  UserMemoryPreferencesWithoutVectors,
  topics,
  userMemories,
  userMemoriesContexts,
  userMemoriesExperiences,
  userMemoriesPreferences,
} from '../../schemas';
import { LobeChatDatabase } from '../../type';

export interface MemorySource {
  agentId: string | null;
  sessionId: string | null;
  topicId: string;
  topicTitle: string | null;
}

// Re-export for backwards compatibility
export type ExperienceSource = MemorySource;

export interface DisplayExperienceMemory extends UserMemoryExperiencesWithoutVectors {
  source: MemorySource | null;
  title: string | null;
}

export interface DisplayPreferenceMemory extends UserMemoryPreferencesWithoutVectors {
  source: MemorySource | null;
  title: string | null;
}

export interface DisplayContextMemory extends UserMemoryContextsWithoutVectors {
  source: MemorySource | null;
}

interface MemoryMetadata {
  sessionId?: string;
  topicId?: string;
}

// Re-export for backwards compatibility
type ExperienceMetadata = MemoryMetadata;

/**
 * UserMemory Repository - provides aggregated queries across memory-related tables
 */
export class UserMemoryRepo {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  /**
   * Get display experiences with topic and agent information
   * This is a list query ordered by createdAt, not a search query
   */
  async getDisplayExperiences(params?: {
    limit?: number;
    type?: string;
  }): Promise<DisplayExperienceMemory[]> {
    const { limit = 50, type } = params ?? {};

    // Build conditions
    const conditions = [eq(userMemoriesExperiences.userId, this.userId)];
    if (type) {
      conditions.push(eq(userMemoriesExperiences.type, type));
    }

    // Query experiences directly - this is a list query, not a search
    const experiences = await this.db
      .select({
        accessedAt: userMemoriesExperiences.accessedAt,
        action: userMemoriesExperiences.action,
        createdAt: userMemoriesExperiences.createdAt,
        id: userMemoriesExperiences.id,
        keyLearning: userMemoriesExperiences.keyLearning,
        metadata: userMemoriesExperiences.metadata,
        possibleOutcome: userMemoriesExperiences.possibleOutcome,
        reasoning: userMemoriesExperiences.reasoning,
        scoreConfidence: userMemoriesExperiences.scoreConfidence,
        situation: userMemoriesExperiences.situation,
        tags: userMemoriesExperiences.tags,
        type: userMemoriesExperiences.type,
        updatedAt: userMemoriesExperiences.updatedAt,
        userId: userMemoriesExperiences.userId,
        userMemoryId: userMemoriesExperiences.userMemoryId,
      })
      .from(userMemoriesExperiences)
      .where(and(...conditions))
      .orderBy(desc(userMemoriesExperiences.createdAt))
      .limit(limit);

    if (experiences.length === 0) {
      return [];
    }

    // Extract userMemoryIds to fetch titles
    const userMemoryIds = experiences
      .map((exp) => exp.userMemoryId)
      .filter((id): id is string => !!id);
    const uniqueUserMemoryIds = [...new Set(userMemoryIds)];

    // Batch query userMemories to get titles
    const userMemoriesData =
      uniqueUserMemoryIds.length > 0
        ? await this.db
            .select({
              id: userMemories.id,
              title: userMemories.title,
            })
            .from(userMemories)
            .where(
              and(
                eq(userMemories.userId, this.userId),
                inArray(userMemories.id, uniqueUserMemoryIds),
              ),
            )
        : [];

    const userMemoryMap = new Map(userMemoriesData.map((m) => [m.id, m]));

    // Extract topicIds from metadata
    const topicIds = experiences
      .map((exp) => (exp.metadata as ExperienceMetadata | null)?.topicId)
      .filter((id): id is string => !!id);

    const uniqueTopicIds = [...new Set(topicIds)];

    // Batch query topics to get titles and agentIds
    const topicsData =
      uniqueTopicIds.length > 0
        ? await this.db
            .select({
              agentId: topics.agentId,
              id: topics.id,
              sessionId: topics.sessionId,
              title: topics.title,
            })
            .from(topics)
            .where(and(eq(topics.userId, this.userId), inArray(topics.id, uniqueTopicIds)))
        : [];

    // Create a map for quick lookup
    const topicMap = new Map(topicsData.map((t) => [t.id, t]));

    // Map experiences to display format
    return experiences.map((exp) => {
      const metadata = exp.metadata as MemoryMetadata | null;
      const topicId = metadata?.topicId;
      const sessionId = metadata?.sessionId;
      const memoryTitle = exp.userMemoryId
        ? (userMemoryMap.get(exp.userMemoryId)?.title ?? null)
        : null;

      if (!topicId) {
        return { ...exp, source: null, title: memoryTitle };
      }

      const topic = topicMap.get(topicId);

      return {
        ...exp,
        source: {
          agentId: topic?.agentId ?? null,
          sessionId: topic?.sessionId ?? sessionId ?? null,
          topicId,
          topicTitle: topic?.title ?? null,
        },
        title: memoryTitle,
      };
    });
  }

  /**
   * Get display preferences with topic and agent information
   * This is a list query ordered by createdAt, not a search query
   */
  async getDisplayPreferences(params?: {
    limit?: number;
    type?: string;
  }): Promise<DisplayPreferenceMemory[]> {
    const { limit = 50, type } = params ?? {};

    // Build conditions
    const conditions = [eq(userMemoriesPreferences.userId, this.userId)];
    if (type) {
      conditions.push(eq(userMemoriesPreferences.type, type));
    }

    // Query preferences directly - this is a list query, not a search
    const preferences = await this.db
      .select({
        accessedAt: userMemoriesPreferences.accessedAt,
        conclusionDirectives: userMemoriesPreferences.conclusionDirectives,
        createdAt: userMemoriesPreferences.createdAt,
        id: userMemoriesPreferences.id,
        metadata: userMemoriesPreferences.metadata,
        scorePriority: userMemoriesPreferences.scorePriority,
        suggestions: userMemoriesPreferences.suggestions,
        tags: userMemoriesPreferences.tags,
        type: userMemoriesPreferences.type,
        updatedAt: userMemoriesPreferences.updatedAt,
        userId: userMemoriesPreferences.userId,
        userMemoryId: userMemoriesPreferences.userMemoryId,
      })
      .from(userMemoriesPreferences)
      .where(and(...conditions))
      .orderBy(desc(userMemoriesPreferences.createdAt))
      .limit(limit);

    if (preferences.length === 0) {
      return [];
    }

    // Extract userMemoryIds to fetch titles
    const userMemoryIds = preferences
      .map((pref) => pref.userMemoryId)
      .filter((id): id is string => !!id);
    const uniqueUserMemoryIds = [...new Set(userMemoryIds)];

    // Batch query userMemories to get titles
    const userMemoriesData =
      uniqueUserMemoryIds.length > 0
        ? await this.db
            .select({
              id: userMemories.id,
              title: userMemories.title,
            })
            .from(userMemories)
            .where(
              and(
                eq(userMemories.userId, this.userId),
                inArray(userMemories.id, uniqueUserMemoryIds),
              ),
            )
        : [];

    const userMemoryMap = new Map(userMemoriesData.map((m) => [m.id, m]));

    // Extract topicIds from metadata
    const topicIds = preferences
      .map((pref) => (pref.metadata as MemoryMetadata | null)?.topicId)
      .filter((id): id is string => !!id);

    const uniqueTopicIds = [...new Set(topicIds)];

    // Batch query topics to get titles and agentIds
    const topicsData =
      uniqueTopicIds.length > 0
        ? await this.db
            .select({
              agentId: topics.agentId,
              id: topics.id,
              sessionId: topics.sessionId,
              title: topics.title,
            })
            .from(topics)
            .where(and(eq(topics.userId, this.userId), inArray(topics.id, uniqueTopicIds)))
        : [];

    // Create a map for quick lookup
    const topicMap = new Map(topicsData.map((t) => [t.id, t]));

    // Map preferences to display format
    return preferences.map((pref) => {
      const metadata = pref.metadata as MemoryMetadata | null;
      const topicId = metadata?.topicId;
      const sessionId = metadata?.sessionId;
      const memoryTitle = pref.userMemoryId
        ? (userMemoryMap.get(pref.userMemoryId)?.title ?? null)
        : null;

      if (!topicId) {
        return { ...pref, source: null, title: memoryTitle };
      }

      const topic = topicMap.get(topicId);

      return {
        ...pref,
        source: {
          agentId: topic?.agentId ?? null,
          sessionId: topic?.sessionId ?? sessionId ?? null,
          topicId,
          topicTitle: topic?.title ?? null,
        },
        title: memoryTitle,
      };
    });
  }

  /**
   * Get display contexts with topic and agent information
   * This is a list query ordered by createdAt, not a search query
   */
  async getDisplayContexts(params?: {
    limit?: number;
    type?: string;
  }): Promise<DisplayContextMemory[]> {
    const { limit = 50, type } = params ?? {};

    // Build conditions
    const conditions = [eq(userMemoriesContexts.userId, this.userId)];
    if (type) {
      conditions.push(eq(userMemoriesContexts.type, type));
    }

    // Query contexts directly - this is a list query, not a search
    const contexts = await this.db
      .select({
        accessedAt: userMemoriesContexts.accessedAt,
        associatedObjects: userMemoriesContexts.associatedObjects,
        associatedSubjects: userMemoriesContexts.associatedSubjects,
        createdAt: userMemoriesContexts.createdAt,
        currentStatus: userMemoriesContexts.currentStatus,
        description: userMemoriesContexts.description,
        id: userMemoriesContexts.id,
        metadata: userMemoriesContexts.metadata,
        scoreImpact: userMemoriesContexts.scoreImpact,
        scoreUrgency: userMemoriesContexts.scoreUrgency,
        tags: userMemoriesContexts.tags,
        title: userMemoriesContexts.title,
        type: userMemoriesContexts.type,
        updatedAt: userMemoriesContexts.updatedAt,
        userId: userMemoriesContexts.userId,
        userMemoryIds: userMemoriesContexts.userMemoryIds,
      })
      .from(userMemoriesContexts)
      .where(and(...conditions))
      .orderBy(desc(userMemoriesContexts.createdAt))
      .limit(limit);

    if (contexts.length === 0) {
      return [];
    }

    // Extract topicIds from metadata
    const topicIds = contexts
      .map((ctx) => (ctx.metadata as MemoryMetadata | null)?.topicId)
      .filter((id): id is string => !!id);

    const uniqueTopicIds = [...new Set(topicIds)];

    // Batch query topics to get titles and agentIds
    const topicsData =
      uniqueTopicIds.length > 0
        ? await this.db
            .select({
              agentId: topics.agentId,
              id: topics.id,
              sessionId: topics.sessionId,
              title: topics.title,
            })
            .from(topics)
            .where(and(eq(topics.userId, this.userId), inArray(topics.id, uniqueTopicIds)))
        : [];

    // Create a map for quick lookup
    const topicMap = new Map(topicsData.map((t) => [t.id, t]));

    // Map contexts to display format
    return contexts.map((ctx) => {
      const metadata = ctx.metadata as MemoryMetadata | null;
      const topicId = metadata?.topicId;
      const sessionId = metadata?.sessionId;

      if (!topicId) {
        return { ...ctx, source: null };
      }

      const topic = topicMap.get(topicId);

      return {
        ...ctx,
        source: {
          agentId: topic?.agentId ?? null,
          sessionId: topic?.sessionId ?? sessionId ?? null,
          topicId,
          topicTitle: topic?.title ?? null,
        },
      };
    });
  }
}
