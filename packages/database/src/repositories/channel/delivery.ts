import { and, eq, inArray, sql } from 'drizzle-orm';

import type {
  ChannelMemberItem,
  ChannelMessageItem,
  ChannelThreadItem,
  NewChannelMessage,
} from '../../schemas';
import {
  channelJobs,
  channelMembers,
  channelMessages,
  channels,
  channelThreads,
  messages,
  topics,
} from '../../schemas';
import type { Transaction } from '../../type';
import { idGenerator } from '../../utils/idGenerator';
import { ChannelError } from './error';

/** The Thread a message belongs to, or null for the main channel. */
export const findThread = async (
  tx: Transaction,
  channelId: string,
  threadId?: string | null,
): Promise<ChannelThreadItem | null> => {
  if (!threadId) return null;

  const [thread] = await tx
    .select()
    .from(channelThreads)
    .where(and(eq(channelThreads.channelId, channelId), eq(channelThreads.id, threadId)));
  if (!thread) throw new ChannelError('NOT_FOUND', 'Thread not found');

  return thread;
};

/** Active members by id. Throws when any of them is missing or has left. */
export const activeMembers = async (
  tx: Transaction,
  channelId: string,
  memberIds: string[],
): Promise<ChannelMemberItem[]> => {
  const unique = [...new Set(memberIds)];
  if (!unique.length) return [];

  const members = await tx
    .select()
    .from(channelMembers)
    .where(
      and(
        eq(channelMembers.channelId, channelId),
        eq(channelMembers.active, true),
        inArray(channelMembers.id, unique),
      ),
    );
  if (members.length !== unique.length)
    throw new ChannelError('BAD_REQUEST', 'A selected member is unavailable');

  return members;
};

/**
 * Agents that may answer a message without @mentions: every active Agent on the main
 * channel, the following Agents inside a Thread.
 */
export const candidateAgents = async (
  tx: Transaction,
  channelId: string,
  thread: ChannelThreadItem | null,
): Promise<ChannelMemberItem[]> => {
  const agents = await tx
    .select()
    .from(channelMembers)
    .where(
      and(
        eq(channelMembers.channelId, channelId),
        eq(channelMembers.actorType, 'agent'),
        eq(channelMembers.active, true),
      ),
    );

  return thread ? agents.filter((agent) => thread.followerMemberIds.includes(agent.id)) : agents;
};

/**
 * Queues one job per Agent. Idempotent through the delivery key. Skips Agents whose
 * environment changed after the message, so a late route cannot run an old instruction
 * in a new directory. Returns the ids of the Agents that received a job.
 */
export const deliver = async (
  tx: Transaction,
  message: ChannelMessageItem,
  agents: ChannelMemberItem[],
  requesterMemberId: string,
): Promise<string[]> => {
  const recipients = agents.filter(
    (agent) => agent.actorType === 'agent' && message.sequence > agent.environmentCutoff,
  );
  if (!recipients.length) return [];

  await tx
    .insert(channelJobs)
    .values(
      recipients.map((agent) => ({
        channelId: message.channelId,
        memberId: agent.id,
        messageId: message.id,
        requesterMemberId,
        threadId: message.threadId,
      })),
    )
    .onConflictDoNothing();

  return recipients.map((agent) => agent.id);
};

/** Appends a message at the next channel sequence. The caller holds the channel lock. */
export const appendMessage = async (
  tx: Transaction,
  values: Omit<NewChannelMessage, 'sequence' | 'id'> & { id?: string },
): Promise<ChannelMessageItem> => {
  const [{ sequence }] = await tx
    .update(channels)
    .set({ sequence: sql`${channels.sequence} + 1` })
    .where(eq(channels.id, values.channelId))
    .returning({ sequence: channels.sequence });
  const [topic] = await tx
    .select()
    .from(topics)
    .where(and(eq(topics.channelId, values.channelId), eq(topics.mode, 'channel')));
  if (!topic) throw new ChannelError('NOT_FOUND', 'Public channel topic not found');
  const [author] = await tx
    .select()
    .from(channelMembers)
    .where(
      and(
        eq(channelMembers.id, values.authorMemberId),
        eq(channelMembers.channelId, values.channelId),
      ),
    );
  if (!author) throw new ChannelError('NOT_FOUND', 'Author not found');
  const { content, ...extension } = values;
  const id = values.id ?? idGenerator('messages');
  await tx.insert(messages).values({
    id,
    content,
    channelId: values.channelId,
    topicId: topic.id,
    userId: null,
    workspaceId: topic.workspaceId,
    role: author.actorType === 'agent' ? 'assistant' : 'user',
    parentId: values.replyToId,
  });
  const [message] = await tx
    .insert(channelMessages)
    .values({ ...extension, id, sequence })
    .returning();

  return { ...message, content };
};
