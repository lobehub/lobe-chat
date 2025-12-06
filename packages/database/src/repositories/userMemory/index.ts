import { and, desc, eq, inArray } from 'drizzle-orm';

import {
  UserMemoryExperiencesWithoutVectors,
  topics,
  userMemories,
  userMemoriesExperiences,
} from '../../schemas';
import { LobeChatDatabase } from '../../type';

export interface ExperienceSource {
  agentId: string | null;
  sessionId: string | null;
  topicId: string;
  topicTitle: string | null;
}

export interface DisplayExperienceMemory extends UserMemoryExperiencesWithoutVectors {
  source: ExperienceSource | null;
  title: string | null;
}

interface ExperienceMetadata {
  sessionId?: string;
  topicId?: string;
}

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
      const metadata = exp.metadata as ExperienceMetadata | null;
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
}
