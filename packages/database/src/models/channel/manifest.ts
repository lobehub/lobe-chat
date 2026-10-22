import type { ChannelInputManifest } from '@lobechat/types';
import { CHANNEL_DELETED_USER_NAME } from '@lobechat/types';
import { and, asc, eq, gt, isNull, lte, or } from 'drizzle-orm';

import type {
  ChannelJobItem,
  ChannelMemberItem,
  ChannelMessageItem,
  ChannelSessionItem,
  ChannelThreadItem,
} from '../../schemas';
import { channelMembers, channelMessages, users } from '../../schemas';
import type { Transaction } from '../../type';

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
 * Input for one run, frozen at claim time. A Thread sees its own messages plus the main
 * channel up to its root. An existing session receives only what it has not accepted; a new
 * one gets the full snapshot. Later messages belong to the next run.
 *
 * The request itself is always included. A message Jev routed late can sit behind the
 * session's cursor because the member already accepted newer ones; it arrived then only as
 * context, and the run needs it as its task.
 */
export const buildManifest = async (
  tx: Transaction,
  params: {
    job: ChannelJobItem;
    member: ChannelMemberItem;
    request: ChannelMessageItem;
    session: ChannelSessionItem;
    thread: ChannelThreadItem | null;
  },
): Promise<ChannelInputManifest> => {
  const { job, member, request, session, thread } = params;
  const incremental = Boolean(session.nativeSessionId);
  const cutoffSequence = request.sequence;

  const branch = thread
    ? or(
        eq(channelMessages.threadId, thread.id),
        and(isNull(channelMessages.threadId), lte(channelMessages.sequence, thread.rootSequence)),
      )
    : isNull(channelMessages.threadId);
  const visible = await tx
    .select()
    .from(channelMessages)
    .where(
      and(
        eq(channelMessages.channelId, job.channelId),
        lte(channelMessages.sequence, cutoffSequence),
        incremental ? gt(channelMessages.sequence, session.acceptedSequence) : undefined,
        branch,
      ),
    )
    .orderBy(asc(channelMessages.sequence));
  // The cutoff is the request's own sequence, so it always sorts last.
  if (!visible.some((message) => message.id === request.id)) visible.push(request);
  const names = await rosterNames(tx, job.channelId);

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
        ...(message.fileIds.length && { fileIds: message.fileIds }),
        id: message.id,
        sequence: message.sequence,
        threadId: message.threadId,
      };
    }),
    requestMessageId: request.id,
    requesterMemberId: job.requesterMemberId,
    self: { memberId: member.id, name: member.name ?? 'Agent' },
    sessionGeneration: session.generation,
    source: incremental ? 'incremental' : 'reconstructed',
    threadId: job.threadId,
    threadRootSequence: thread?.rootSequence ?? null,
  };
};
