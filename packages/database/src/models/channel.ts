import type { ChannelMemberRole, ChannelVisibility } from '@lobechat/types';
import { and, desc, eq, isNull } from 'drizzle-orm';

import type { ChannelItem, ChannelMemberItem } from '../schemas';
import { channelMembers, channels } from '../schemas';
import type { LobeChatDatabase, Transaction } from '../type';
import { normalizeWorkspaceId } from '../utils/workspace';

const ROLE_RANK: Record<ChannelMemberRole, number> = { admin: 1, member: 0, owner: 2 };

export class ChannelError extends Error {
  constructor(
    readonly code: 'CONFLICT' | 'FORBIDDEN' | 'NOT_FOUND',
    message: string,
  ) {
    super(message);
    this.name = 'ChannelError';
  }
}

export interface ChannelAccess {
  channel: ChannelItem;
  /** The caller's own human member row. */
  member: ChannelMemberItem;
}

export interface ChannelWriteOptions {
  /** Lets owners and admins un-archive or clean up an archived channel. */
  allowArchived?: boolean;
  minRole?: ChannelMemberRole;
}

/**
 * Membership-scoped access to channels (LOBE-15104 §4).
 *
 * A caller reaches a channel only through its own active human member row, in the current
 * scope (personal, or the given workspace). Every write runs inside `write`, which holds the
 * `channels` row lock so mutations of one channel serialize.
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
   * active member with at least `minRole` (default `member`).
   */
  write = async <T>(
    channelId: string,
    fn: (tx: Transaction, access: ChannelAccess) => Promise<T>,
    options: ChannelWriteOptions = {},
  ): Promise<T> =>
    this.db.transaction(async (tx) => {
      const [row] = await tx
        .select({ channel: channels, member: channelMembers })
        .from(channels)
        .innerJoin(channelMembers, eq(channelMembers.channelId, channels.id))
        .where(and(eq(channels.id, channelId), this.membershipWhere()))
        .limit(1)
        .for('update', { of: channels });

      if (!row) throw new ChannelError('NOT_FOUND', 'Channel not found');

      const minRole = options.minRole ?? 'member';
      const role = row.member.role ?? 'member';
      if (ROLE_RANK[role] < ROLE_RANK[minRole])
        throw new ChannelError('FORBIDDEN', `Requires the ${minRole} role in this channel`);
      if (row.channel.archived && !options.allowArchived)
        throw new ChannelError('CONFLICT', 'Channel is archived');

      return fn(tx, row);
    });

  private membershipWhere() {
    return and(
      eq(channelMembers.userId, this.userId),
      eq(channelMembers.active, true),
      this.workspaceId ? eq(channels.workspaceId, this.workspaceId) : isNull(channels.workspaceId),
    );
  }
}
