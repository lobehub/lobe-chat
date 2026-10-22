import type { ChannelMemberRole, ChannelVisibility } from '@lobechat/types';
import { and, desc, eq, isNull } from 'drizzle-orm';

import type { ChannelItem, ChannelMessageItem, ChannelRunItem } from '../../schemas';
import { channelMembers, channelMessages, channelRuns, channels } from '../../schemas';
import type { LobeChatDatabase, Transaction } from '../../type';
import { normalizeWorkspaceId } from '../../utils/workspace';
import { ChannelError } from './error';
import { retryRouting } from './routing';
import type { ChannelSendInput } from './send';
import { sendMessage } from './send';
import type { ChannelStopScope } from './stop';
import { stopScope } from './stop';
import { bumpRevision, lockChannel } from './transaction';
import type { ChannelAccess, ChannelWriteOptions } from './types';

export type { ChannelClaim, ChannelClaimOptions } from './claim';
export type { ChannelErrorCode } from './error';
export { ChannelError } from './error';
export { ChannelExecutionModel } from './execution';
export type { ChannelRoutingDecision } from './routing';
export type { ChannelSendInput } from './send';
export type { ChannelStopScope } from './stop';
export type { ChannelAccess, ChannelWriteOptions } from './types';

const ROLE_RANK: Record<ChannelMemberRole, number> = { admin: 1, member: 0, owner: 2 };

const hasRole = (role: ChannelMemberRole | null, minRole: ChannelMemberRole) =>
  ROLE_RANK[role ?? 'member'] >= ROLE_RANK[minRole];

/**
 * Membership-scoped access to channels (LOBE-15104 §4).
 *
 * A caller reaches a channel only through its own active human member row, in the current
 * scope (personal, or the given workspace). Every write runs inside `write`, which holds the
 * `channels` row lock so mutations of one channel serialize, and bumps `channels.revision`
 * once in the same transaction.
 */
export class ChannelModel {
  private readonly workspaceId: string | null;

  constructor(
    private readonly db: LobeChatDatabase,
    private readonly userId: string,
    workspaceId?: string | null,
  ) {
    this.workspaceId = normalizeWorkspaceId(workspaceId);
  }

  /** Creates the channel with the caller as its owner member. */
  create = async (params: { title: string; visibility?: ChannelVisibility }) =>
    this.db.transaction(async (tx) => {
      const [channel] = await tx
        .insert(channels)
        .values({
          creatorId: this.userId,
          title: params.title,
          visibility: params.visibility,
          workspaceId: this.workspaceId,
        })
        .returning();
      const [member] = await tx
        .insert(channelMembers)
        .values({
          actorType: 'user',
          channelId: channel.id,
          lastReadSequence: 0,
          role: 'owner',
          userId: this.userId,
        })
        .returning();

      return { channel, member } satisfies ChannelAccess;
    });

  /** Active channels the caller belongs to in the current scope, newest first. */
  list = async (): Promise<ChannelItem[]> => {
    const rows = await this.db
      .select({ channel: channels })
      .from(channels)
      .innerJoin(channelMembers, eq(channelMembers.channelId, channels.id))
      .where(and(this.membershipWhere(), eq(channels.archived, false)))
      .orderBy(desc(channels.createdAt));

    return rows.map((row) => row.channel);
  };

  /** Read access. Returns undefined when the channel is missing or the caller is no member. */
  findAccess = async (channelId: string): Promise<ChannelAccess | undefined> => {
    const [row] = await this.db
      .select({ channel: channels, member: channelMembers })
      .from(channels)
      .innerJoin(channelMembers, eq(channelMembers.channelId, channels.id))
      .where(and(eq(channels.id, channelId), this.membershipWhere()))
      .limit(1);

    return row;
  };

  /**
   * Runs `fn` while holding the channel row lock, after checking that the caller is an
   * active member with at least `minRole` (default `member`), then bumps the revision.
   */
  write = async <T>(
    channelId: string,
    fn: (tx: Transaction, access: ChannelAccess) => Promise<T>,
    options: ChannelWriteOptions = {},
  ): Promise<T> =>
    this.db.transaction(async (tx) => {
      await lockChannel(tx, channelId);

      // Read membership only after the lock: a removal or demotion committed by the previous
      // lock holder must be visible here, not the snapshot from before the wait.
      const [access] = await tx
        .select({ channel: channels, member: channelMembers })
        .from(channels)
        .innerJoin(channelMembers, eq(channelMembers.channelId, channels.id))
        .where(and(eq(channels.id, channelId), this.membershipWhere()))
        .limit(1);
      if (!access) throw new ChannelError('NOT_FOUND', 'Channel not found');

      const minRole = options.minRole ?? 'member';
      if (!hasRole(access.member.role, minRole))
        throw new ChannelError('FORBIDDEN', `Requires the ${minRole} role in this channel`);
      if (access.channel.archived && !options.allowArchived)
        throw new ChannelError('CONFLICT', 'Channel is archived');

      const result = await fn(tx, access);
      await bumpRevision(tx, channelId);

      return result;
    });

  /** Posts a message as the caller. See {@link sendMessage} for routing. */
  send = async (channelId: string, input: ChannelSendInput): Promise<ChannelMessageItem> =>
    this.write(channelId, (tx, access) => sendMessage(tx, access, input));

  /**
   * Stops one run (its requester or an admin) or a whole branch (admins). Returns the runs
   * whose writer is still held; the caller must stop them physically.
   */
  stop = async (channelId: string, scope: ChannelStopScope): Promise<ChannelRunItem[]> =>
    this.write(
      channelId,
      async (tx, { member }) => {
        if ('runId' in scope && !hasRole(member.role, 'admin')) {
          const [run] = await tx
            .select({ requesterMemberId: channelRuns.requesterMemberId })
            .from(channelRuns)
            .where(and(eq(channelRuns.channelId, channelId), eq(channelRuns.id, scope.runId)));
          if (run && run.requesterMemberId !== member.id)
            throw new ChannelError('FORBIDDEN', 'Only the requester or an admin can stop this run');
        }
        return stopScope(tx, channelId, scope);
      },
      { allowArchived: true, minRole: 'threadId' in scope ? 'admin' : 'member' },
    );

  /** Sends an unassigned message back to Jev. Its author or an admin may retry. */
  retryRouting = async (channelId: string, messageId: string): Promise<ChannelMessageItem> =>
    this.write(channelId, async (tx, { member }) => {
      if (!hasRole(member.role, 'admin')) {
        const [message] = await tx
          .select({ authorMemberId: channelMessages.authorMemberId })
          .from(channelMessages)
          .where(and(eq(channelMessages.channelId, channelId), eq(channelMessages.id, messageId)));
        if (message && message.authorMemberId !== member.id)
          throw new ChannelError('FORBIDDEN', 'Only the author or an admin can retry routing');
      }
      return retryRouting(tx, channelId, messageId);
    });

  private membershipWhere() {
    return and(
      eq(channelMembers.userId, this.userId),
      eq(channelMembers.active, true),
      this.workspaceId ? eq(channels.workspaceId, this.workspaceId) : isNull(channels.workspaceId),
    );
  }
}
