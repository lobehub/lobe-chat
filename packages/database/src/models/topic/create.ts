import type { DBMessageItem } from '@lobechat/types';
import { runTimedSinkStage as runTimedStage } from '@lobechat/utils';
import { and, eq, inArray } from 'drizzle-orm';

import { clampToolIdentifier } from '@/utils/clampToolIdentifier';

import { messagePlugins, messages, type TopicItem, topics } from '../../schemas';
import { COPIED_TOPIC_USAGE_RESET } from '../../utils/copiedTranscript';
import { markCopiedMessageMetadata } from '../../utils/copyMessagesInDatabase';
import { idGenerator } from '../../utils/idGenerator';
import { buildWorkspacePayload } from '../../utils/workspace';
import type { TopicModelContext } from './context';
import type { CreateTopicParams, ModelTimingContext } from './types';

export const create = async (
  ctx: TopicModelContext,
  { messages: messageIds, ...params }: CreateTopicParams,
  id: string = ctx.genId(),
  timing?: ModelTimingContext,
): Promise<TopicItem> => {
  const insertData = buildWorkspacePayload(
    { userId: ctx.userId, workspaceId: ctx.workspaceId },
    {
      ...params,
      agentId: params.agentId || null,
      groupId: params.groupId || null,
      id,
      sessionId: params.sessionId || null,
    },
  );
  const insertMeta = {
    hasAgentId: !!params.agentId,
    hasGroupId: !!params.groupId,
    hasSessionId: !!params.sessionId,
  };

  if (!messageIds || messageIds.length === 0) {
    const [topic] = await runTimedStage(
      timing,
      'db.topic.create.topics.insert',
      () => ctx.db.insert(topics).values(insertData).returning(),
      insertMeta,
    );

    return topic;
  }

  return runTimedStage(
    timing,
    'db.topic.create.transaction',
    () =>
      ctx.db.transaction(async (tx) => {
        // Insert new topic
        const [topic] = await runTimedStage(
          timing,
          'db.topic.create.topics.insert',
          () => tx.insert(topics).values(insertData).returning(),
          insertMeta,
        );

        // Update associated messages' topicId
        await runTimedStage(
          timing,
          'db.topic.create.messages.updateTopic',
          () =>
            tx
              .update(messages)
              .set({ topicId: topic.id })
              .where(and(ctx.messageOwnership(), inArray(messages.id, messageIds))),
          { messageCount: messageIds.length },
        );

        return topic;
      }),
    {
      hasAgentId: !!params.agentId,
      hasGroupId: !!params.groupId,
      hasSessionId: !!params.sessionId,
      messageCount: messageIds?.length ?? 0,
    },
  );
};

export const batchCreate = async (
  ctx: TopicModelContext,
  topicParams: (CreateTopicParams & { id?: string })[],
) => {
  // Start a transaction
  return ctx.db.transaction(async (tx) => {
    // Batch insert new topics into the topics table
    const createdTopics = await tx
      .insert(topics)
      .values(
        topicParams.map((params) =>
          buildWorkspacePayload(
            { userId: ctx.userId, workspaceId: ctx.workspaceId },
            {
              agentId: params.agentId || null,
              favorite: params.favorite,
              groupId: params.sessionId ? null : params.groupId,
              id: params.id || ctx.genId(),
              sessionId: params.groupId ? null : params.sessionId,
              title: params.title,
              trigger: params.trigger,
            },
          ),
        ),
      )
      .returning();

    // For each newly created topic, update the topicId of associated messages
    await Promise.all(
      createdTopics.map(async (topic, index) => {
        const messageIds = topicParams[index].messages;
        if (messageIds && messageIds.length > 0) {
          await tx
            .update(messages)
            .set({ topicId: topic.id })
            .where(and(ctx.messageOwnership(), inArray(messages.id, messageIds)));
        }
      }),
    );

    return createdTopics;
  });
};

/**
 * Copy a topic into a new one.
 *
 * `options.upToMessageId` narrows the copy to the ancestor chain ending at
 * that message (first message → that message) — the "fork from here" path.
 * Without it the whole topic is copied, matching the duplicate action.
 */
export const duplicate = async (
  ctx: TopicModelContext,
  topicId: string,
  newTitle?: string,
  options?: { upToMessageId?: string },
) => {
  return ctx.db.transaction(async (tx) => {
    // find original topic
    const originalTopic = await tx.query.topics.findFirst({
      where: and(eq(topics.id, topicId), ctx.ownership()),
    });

    if (!originalTopic) {
      throw new Error(`Topic with id ${topicId} not found`);
    }

    // A copy is a brand-new topic: stamp its own timestamps instead of
    // inheriting the source's. The sidebar sorts and groups by the latest
    // activity time (`topicActivityAt`, i.e. the newest message), so a copy
    // that kept the source's date would re-file itself under the source's
    // original day instead of showing up as what it is — activity now.
    const copiedAt = new Date();

    // copy topic
    const [duplicatedTopic] = await tx
      .insert(topics)
      .values(
        buildWorkspacePayload(
          { userId: ctx.userId, workspaceId: ctx.workspaceId },
          {
            ...originalTopic,
            ...COPIED_TOPIC_USAGE_RESET,
            clientId: null,
            createdAt: copiedAt,
            id: ctx.genId(),
            title: newTitle || originalTopic?.title,
            updatedAt: copiedAt,
          },
        ),
      )
      .returning();

    // Find messages associated with the original topic, ordered by createdAt
    const topicMessages = await tx
      .select()
      .from(messages)
      .where(and(eq(messages.topicId, topicId), ctx.messageOwnership()))
      .orderBy(messages.createdAt);

    // A fork copies only the selected prefix of the conversation (first
    // message → `upToMessageId`), so sibling branches left behind by
    // regenerate stay in the source topic; a duplicate copies the whole topic.
    let originalMessages = topicMessages;
    if (options?.upToMessageId) {
      const byId = new Map(topicMessages.map((message) => [message.id, message]));
      const selected = byId.get(options.upToMessageId);
      if (!selected) {
        throw new Error(`Message with id ${options.upToMessageId} not found in topic ${topicId}`);
      }

      // Walk up to the root, then reverse back to root → selected so parents
      // are inserted before their children.
      const chain: typeof topicMessages = [];
      const visited = new Set<string>();
      let cursor: (typeof topicMessages)[number] | undefined = selected;
      while (cursor && !visited.has(cursor.id)) {
        visited.add(cursor.id);
        chain.push(cursor);
        cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
      }

      originalMessages = chain.reverse();
    }

    // Find all messagePlugins for this topic
    const messageIds = originalMessages.map((m) => m.id);
    const originalPlugins =
      messageIds.length > 0
        ? await tx.select().from(messagePlugins).where(inArray(messagePlugins.id, messageIds))
        : [];

    // Build oldId -> newId mapping for messages
    const idMap = new Map<string, string>();
    originalMessages.forEach((message) => {
      idMap.set(message.id, idGenerator('messages'));
    });

    // Build oldToolId -> newToolId mapping for tools
    const toolIdMap = new Map<string, string>();
    originalMessages.forEach((message) => {
      if (message.tools && Array.isArray(message.tools)) {
        (message.tools as any[]).forEach((tool: any) => {
          if (tool.id) {
            toolIdMap.set(tool.id, `toolu_${idGenerator('messages')}`);
          }
        });
      }
    });

    // copy messages sequentially to respect foreign key constraints
    const duplicatedMessages: DBMessageItem[] = [];
    for (const [index, message] of originalMessages.entries()) {
      const newId = idMap.get(message.id)!;
      const newParentId = message.parentId ? idMap.get(message.parentId) || null : null;

      // Retime the copy to the copy moment while preserving its internal
      // order (monotonic, 1ms apart, ending at `copiedAt`). The sidebar's
      // activity key is the newest message time, so carrying the source's
      // timestamps would keep the new topic in the source's date group.
      const messageAt = new Date(copiedAt.getTime() - (originalMessages.length - 1 - index));

      // Update tool IDs in tools array
      let newTools = message.tools;
      if (newTools && Array.isArray(newTools)) {
        newTools = (newTools as any[]).map((tool: any) => ({
          ...tool,
          id: tool.id ? toolIdMap.get(tool.id) || tool.id : tool.id,
        }));
      }

      const result = (await tx
        .insert(messages)
        .values({
          ...message,
          clientId: null,
          createdAt: messageAt,
          id: newId,
          // A duplicate consumed no tokens: mark it so usage reports do not
          // count the source's generation twice (the figures themselves stay
          // — they are what the transcript records).
          metadata: markCopiedMessageMetadata(message.metadata),
          parentId: newParentId,
          tools: newTools,
          topicId: duplicatedTopic.id,
          updatedAt: messageAt,
        })
        .returning()) as DBMessageItem[];

      duplicatedMessages.push(result[0]);

      // Copy messagePlugins if exists for this message
      const plugin = originalPlugins.find((p) => p.id === message.id);
      if (plugin) {
        const newToolCallId = plugin.toolCallId ? toolIdMap.get(plugin.toolCallId) || null : null;

        await tx.insert(messagePlugins).values({
          ...plugin,
          apiName: clampToolIdentifier(plugin.apiName),
          clientId: null,
          id: newId,
          identifier: clampToolIdentifier(plugin.identifier),
          toolCallId: newToolCallId,
        });
      }
    }

    return {
      messages: duplicatedMessages,
      topic: duplicatedTopic,
    };
  });
};
