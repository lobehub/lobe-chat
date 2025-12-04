import { messages, topics } from '@lobechat/database/schemas';
import type { ChatTopicMetadata } from '@lobechat/types';
import { and, asc, eq } from 'drizzle-orm';
import { createHash } from 'node:crypto';

import {
  MemoryExtractionJob,
  MemoryExtractionProvider,
  MemoryExtractionSourceType,
  PreparedExtractionContext,
  ProviderDeps,
} from '../types';

export interface ChatTopicProviderOptions {
  availableCategories?: string[];
  language?: string;
  topK?: number;
  username?: string;
  version?: string;
}

const SOURCE_KEY: MemoryExtractionSourceType = 'chat_topic';

const computeDigest = (conversation: PreparedExtractionContext['conversation']) => {
  const hash = createHash('sha256');
  conversation.forEach((message) => {
    hash.update(`${message.role}:${message.content}\n`);
  });
  return hash.digest('hex');
};

const getExistingState = (metadata?: ChatTopicMetadata | null) => {
  return metadata?.userMemoryExtractRunState ?? null;
};

export class ChatTopicProvider implements MemoryExtractionProvider {
  readonly type: MemoryExtractionSourceType = SOURCE_KEY;

  private readonly options: ChatTopicProviderOptions;

  constructor(options: ChatTopicProviderOptions = {}) {
    this.options = options;
  }

  async prepare(
    job: MemoryExtractionJob,
    deps: ProviderDeps,
  ): Promise<PreparedExtractionContext | null> {
    const topic = await deps.db.query.topics.findFirst({
      where: and(eq(topics.id, job.sourceId), eq(topics.userId, job.userId)),
    });
    if (!topic) {
      return null;
    }

    const rows = await deps.db
      .select({
        content: messages.content,
        createdAt: messages.createdAt,
        id: messages.id,
        role: messages.role,
      })
      .from(messages)
      .where(and(eq(messages.userId, job.userId), eq(messages.topicId, job.sourceId)))
      .orderBy(asc(messages.createdAt));

    const conversation = rows
      .filter((row) => typeof row.content === 'string' && row.content.trim().length > 0)
      .map((row) => ({
        content: row.content as string,
        createdAt: row.createdAt ?? undefined,
        role: row.role ?? 'assistant',
      }));

    if (conversation.length === 0) {
      return null;
    }

    const digest = computeDigest(conversation);
    const latestMessage = conversation.at(-1);
    const latestMessageAt = latestMessage?.createdAt?.toISOString();

    const existingState = getExistingState(topic.metadata);
    if (!job.force && existingState?.lastConversationDigest === digest) {
      return null;
    }

    const options = {
      availableCategories: this.options.availableCategories,
      language: this.options.language,
      sessionDate: latestMessageAt,
      topK: this.options.topK,
      username: this.options.username,
    } satisfies PreparedExtractionContext['options'];

    const metadata: Record<string, unknown> = {
      conversationDigest: digest,
      existingMetadata: topic.metadata,
      latestMessageAt,
      messageIds: rows.map((row) => row.id),
    };

    return {
      conversation,
      metadata,
      options,
      sourceId: job.sourceId,
      topicId: topic.id,
      userId: job.userId,
    } satisfies PreparedExtractionContext;
  }

  async complete(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    result: { createdIds: string[]; layers: Record<string, number | undefined> },
    deps: ProviderDeps,
  ): Promise<void> {
    if (!context.topicId) return;

    const existingMetadata =
      (context.metadata.existingMetadata as ChatTopicMetadata | undefined) ?? {};

    const now = new Date().toISOString();
    const memoryExtraction = existingMetadata.userMemoryExtractRunState ?? {
      error: undefined,
      lastConversationDigest: context.metadata.conversationDigest as string,
      lastMessageAt: context.metadata.latestMessageAt as string | undefined,
      lastRunAt: now,
      messageCount: context.conversation.length,
      processedMemoryCount: result.createdIds.length,
      status: 'completed' as const,
      version: this.options.version,
    };

    memoryExtraction.lastRunAt = now;
    const updatedMetadata: ChatTopicMetadata = {
      ...existingMetadata,
      userMemoryExtractRunState: memoryExtraction,
    };

    await deps.db
      .update(topics)
      .set({ metadata: updatedMetadata, updatedAt: new Date() })
      .where(and(eq(topics.id, context.topicId), eq(topics.userId, job.userId)));
  }

  async fail(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    error: Error,
    deps: ProviderDeps,
  ): Promise<void> {
    if (!context.topicId) return;

    const existingMetadata =
      (context.metadata.existingMetadata as ChatTopicMetadata | undefined) ?? {};

    const now = new Date().toISOString();
    const memoryExtraction = existingMetadata.userMemoryExtractRunState ?? {
      error: error.message,
      lastConversationDigest: context.metadata.conversationDigest as string,
      lastMessageAt: context.metadata.latestMessageAt as string | undefined,
      lastRunAt: now,
      messageCount: context.conversation.length,
      processedMemoryCount: 0,
      status: 'failed' as const,
      version: this.options.version,
    };

    memoryExtraction.lastRunAt = now;

    const updatedMetadata: ChatTopicMetadata = {
      ...existingMetadata,
      userMemoryExtractRunState: memoryExtraction,
    };

    await deps.db
      .update(topics)
      .set({ metadata: updatedMetadata, updatedAt: new Date() })
      .where(and(eq(topics.id, context.topicId), eq(topics.userId, job.userId)));
  }
}
