import type { ChannelInputManifest } from '@lobechat/types';
import { CHANNEL_DELETED_USER_NAME } from '@lobechat/types';
import { and, asc, eq, getTableColumns, isNull, lte, or, sql as canonicalSql } from 'drizzle-orm';

import type {
  ChannelJobItem,
  ChannelMemberItem,
  ChannelMessageItem,
  ChannelThreadItem,
} from '../../schemas';
import { channelMembers, channelMessages, users } from '../../schemas';
import { messages } from '../../schemas/message';
import type { Transaction } from '../../type';
import { fileIdsByMessage } from './attachments';

/** Display names for every member, including people who left or deleted their account. */
const rosterNames = async (tx: Transaction, channelId: string) => {
  const rows = await tx
    .select({
      actorType: channelMembers.actorType,
      fullName: users.fullName,
      id: channelMembers.id,
      name: channelMembers.name,
      username: users.username,
    })
    .from(channelMembers)
    .leftJoin(users, eq(users.id, channelMembers.userId))
    .where(eq(channelMembers.channelId, channelId));

  return new Map(
    rows.map((row) => [
      row.id,
      {
        name:
          row.actorType === 'agent'
            ? row.name || 'Agent'
            : row.fullName || row.username || CHANNEL_DELETED_USER_NAME,
        type: row.actorType,
      },
    ]),
  );
};

/**
 * Input for one run, frozen at claim time. Every run starts a new private topic, so it gets
 * the full snapshot of its branch up to the request: a Thread sees its own messages plus the
 * main channel up to its root. Later messages belong to the next run.
 */
export const buildManifest = async (
  tx: Transaction,
  params: {
    job: ChannelJobItem;
    member: ChannelMemberItem;
    request: ChannelMessageItem;
    thread: ChannelThreadItem | null;
  },
): Promise<ChannelInputManifest> => {
  const { job, member, request, thread } = params;
  // Jobs inherit the request's branch, so the request itself always sorts last.
  const cutoffSequence = request.sequence;

  const branch = thread
    ? or(
        eq(channelMessages.threadId, thread.id),
        and(isNull(channelMessages.threadId), lte(channelMessages.sequence, thread.rootSequence)),
      )
    : isNull(channelMessages.threadId);
  const visible = await tx
    .select({
      ...getTableColumns(channelMessages),
      content: canonicalSql<string>`coalesce(${messages.content}, '')`,
    })
    .from(channelMessages)
    .innerJoin(messages, eq(messages.id, channelMessages.id))
    .where(
      and(
        eq(channelMessages.channelId, job.channelId),
        lte(channelMessages.sequence, cutoffSequence),
        branch,
      ),
    )
    .orderBy(asc(channelMessages.sequence));
  const names = await rosterNames(tx, job.channelId);
  const attachments = await fileIdsByMessage(
    tx,
    visible.map((message) => message.id),
  );

  return {
    cutoffSequence,
    messages: visible.map((message) => {
      const author = names.get(message.authorMemberId);
      return {
        author: {
          id: message.authorMemberId,
          name: author?.name ?? CHANNEL_DELETED_USER_NAME,
          type: author?.type ?? 'user',
        },
        content: message.content,
        ...(attachments.has(message.id) && { fileIds: attachments.get(message.id) }),
        id: message.id,
        sequence: message.sequence,
        threadId: message.threadId,
      };
    }),
    requestMessageId: request.id,
    requesterMemberId: job.requesterMemberId,
    self: { memberId: member.id, name: member.name ?? 'Agent' },
    threadId: job.threadId,
    threadRootSequence: thread?.rootSequence ?? null,
  };
};
