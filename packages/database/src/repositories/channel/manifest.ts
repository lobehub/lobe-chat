import type { ChannelContextMessage, ChannelInputManifest } from '@lobechat/types';
import { CHANNEL_DELETED_USER_NAME } from '@lobechat/types';
import { and, asc, eq, isNull, lte, or, sql as canonicalSql } from 'drizzle-orm';

import type {
  ChannelJobItem,
  ChannelMemberItem,
  ChannelMessageItem,
  ChannelThreadItem,
} from '../../schemas';
import { channelMembers, channelMessages, users } from '../../schemas';
import { messages } from '../../schemas/message';
import type { LobeChatDatabase, Transaction } from '../../type';
import { fileIdsByMessage } from './attachments';

/** Display names for every member, including people who left or deleted their account. */
const rosterNames = async (db: LobeChatDatabase | Transaction, channelId: string) => {
  const rows = await db
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
 *
 * The manifest stores where that snapshot ends, not its messages, so a job does not grow with
 * its branch; {@link readManifestMessages} reads them.
 */
export const buildManifest = (params: {
  job: ChannelJobItem;
  member: ChannelMemberItem;
  request: ChannelMessageItem;
  thread: ChannelThreadItem | null;
}): ChannelInputManifest => {
  const { job, member, request, thread } = params;

  return {
    // Jobs inherit the request's branch, so the request itself always sorts last.
    cutoffSequence: request.sequence,
    requestMessageId: request.id,
    requesterMemberId: job.requesterMemberId,
    self: { memberId: member.id, name: member.name ?? 'Agent' },
    threadId: job.threadId,
    threadRootSequence: thread?.rootSequence ?? null,
  };
};

/** The branch messages a manifest covers; see {@link buildManifest}. */
const manifestScope = (channelId: string, manifest: ChannelInputManifest) => {
  const { threadId, threadRootSequence } = manifest;
  const mainPrefix =
    threadRootSequence === null
      ? undefined
      : and(isNull(channelMessages.threadId), lte(channelMessages.sequence, threadRootSequence));

  return and(
    eq(channelMessages.channelId, channelId),
    lte(channelMessages.sequence, manifest.cutoffSequence),
    threadId
      ? or(eq(channelMessages.threadId, threadId), mainPrefix)
      : isNull(channelMessages.threadId),
  );
};

/**
 * The messages a manifest froze, oldest first. Needs no channel lock: Channel writes change
 * only the routing fields of a sent message, and sequences only grow, so nothing at or before
 * the cutoff changes. Author names and attachments are read at call time: a deleted account
 * reads as deleted and a deleted file is no longer listed.
 */
export const readManifestMessages = async (
  db: LobeChatDatabase | Transaction,
  channelId: string,
  manifest: ChannelInputManifest,
): Promise<ChannelContextMessage[]> => {
  const scope = manifestScope(channelId, manifest);
  const visible = await db
    .select({
      authorMemberId: channelMessages.authorMemberId,
      content: canonicalSql<string>`coalesce(${messages.content}, '')`,
      id: channelMessages.id,
      sequence: channelMessages.sequence,
      threadId: channelMessages.threadId,
    })
    .from(channelMessages)
    .innerJoin(messages, eq(messages.id, channelMessages.id))
    .where(scope)
    .orderBy(asc(channelMessages.sequence));
  const names = await rosterNames(db, channelId);
  const attachments = await fileIdsByMessage(
    db,
    db.select({ id: channelMessages.id }).from(channelMessages).where(scope),
  );

  return visible.map((message) => {
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
  });
};
