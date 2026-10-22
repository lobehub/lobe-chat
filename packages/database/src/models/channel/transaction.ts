import type { ChannelAuditDetails } from '@lobechat/types';
import { eq, sql } from 'drizzle-orm';

import type { ChannelItem } from '../../schemas';
import { channelAudit, channels } from '../../schemas';
import type { LobeChatDatabase, Transaction } from '../../type';
import { ChannelError } from './error';

/**
 * Locks the channel row. Every channel write takes this lock before it touches any child
 * row, so writers always lock in the same order. The returned row is the latest version.
 */
export const lockChannel = async (tx: Transaction, channelId: string): Promise<ChannelItem> => {
  const [channel] = await tx
    .select()
    .from(channels)
    .where(eq(channels.id, channelId))
    .for('update');
  if (!channel) throw new ChannelError('NOT_FOUND', 'Channel not found');

  return channel;
};

/** One bump per committed write; watchers compare it instead of reloading the channel. */
export const bumpRevision = async (tx: Transaction, channelId: string) => {
  await tx
    .update(channels)
    .set({ revision: sql`${channels.revision} + 1` })
    .where(eq(channels.id, channelId));
};

/** Lock, run `fn`, bump the revision, all in one transaction. For system callers. */
export const withChannelLock = async <T>(
  db: LobeChatDatabase,
  channelId: string,
  fn: (tx: Transaction, channel: ChannelItem) => Promise<T>,
): Promise<T> =>
  db.transaction(async (tx) => {
    const channel = await lockChannel(tx, channelId);
    const result = await fn(tx, channel);
    await bumpRevision(tx, channelId);

    return result;
  });

export const audit = async (
  tx: Transaction,
  channelId: string,
  event: string,
  targetId: string,
  details: ChannelAuditDetails = {},
) => {
  await tx.insert(channelAudit).values({ channelId, details, event, targetId });
};
