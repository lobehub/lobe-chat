import type { DBMessageItem } from '@lobechat/types';
import { and, eq, inArray } from 'drizzle-orm';

import { clampToolIdentifier } from '@/utils/clampToolIdentifier';

import { messagePlugins, messages, topics } from '../../schemas';
import { COPIED_TOPIC_USAGE_RESET } from '../../utils/copiedTranscript';
import { markCopiedMessageMetadata } from '../../utils/copyMessagesInDatabase';
import { idGenerator } from '../../utils/idGenerator';
import { buildWorkspacePayload } from '../../utils/workspace';
import { messageOwnership, topicOwnership, type TopicRepositoryScope } from './scope';

/**
 * Copy a topic into a new one.
 *
 * `options.upToMessageId` narrows the copy to the ancestor chain ending at
 * that message (first message → that message) — the "fork from here" path.
 * Without it the whole topic is copied, matching the duplicate action.
 */
export const duplicateTopic = async (
  scope: TopicRepositoryScope,
  topicId: string,
  newTitle?: string,
  options?: { upToMessageId?: string },
) => {
  return scope.db.transaction(async (tx) => {
    // find original topic
    const originalTopic = await tx.query.topics.findFirst({
      where: and(eq(topics.id, topicId), topicOwnership(scope)),
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
          { userId: scope.userId, workspaceId: scope.workspaceId },
          {
            ...originalTopic,
            ...COPIED_TOPIC_USAGE_RESET,
            clientId: null,
            createdAt: copiedAt,
            id: idGenerator('topics'),
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
      .where(and(eq(messages.topicId, topicId), messageOwnership(scope)))
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
