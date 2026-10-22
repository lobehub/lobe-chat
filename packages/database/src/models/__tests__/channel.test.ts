// @vitest-environment node
import { eq, inArray, sql } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { channelMembers, channels, users, workspaces } from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { ChannelError, ChannelModel } from '../channel';
import { UserModel } from '../user';

const serverDB: LobeChatDatabase = await getTestDB();
// Two concurrent transactions need separate connections; PGlite runs them one after another.
const isServerDB = process.env.TEST_SERVER_DB === '1';

const ownerId = 'channel-model-owner';
const memberId = 'channel-model-member';
const outsiderId = 'channel-model-outsider';
const workspaceId = 'channel-model-workspace';

const addPerson = async (channelId: string, userId: string, role: 'admin' | 'member') =>
  serverDB.insert(channelMembers).values({ actorType: 'user', channelId, role, userId });

const revisionOf = async (channelId: string) => {
  const [row] = await serverDB
    .select({ revision: channels.revision })
    .from(channels)
    .where(eq(channels.id, channelId));
  return row?.revision;
};

/** Resolves once some session in this database is waiting on a row lock. */
const waitForLockWaiter = async () => {
  for (let attempt = 0; attempt < 100; attempt++) {
    const { rows } = await serverDB.execute<{ waiting: number }>(
      sql`SELECT count(*)::int AS waiting FROM pg_stat_activity
          WHERE datname = current_database() AND wait_event_type = 'Lock'`,
    );
    if (rows[0]?.waiting) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error('No transaction started waiting for the channel lock');
};

beforeEach(async () => {
  await serverDB.insert(users).values([{ id: ownerId }, { id: memberId }, { id: outsiderId }]);
  await serverDB
    .insert(workspaces)
    .values({ id: workspaceId, name: 'Workspace', primaryOwnerId: ownerId, slug: workspaceId });
});

afterEach(async () => {
  await serverDB.delete(workspaces).where(eq(workspaces.id, workspaceId));
  await serverDB.delete(users).where(inArray(users.id, [ownerId, memberId, outsiderId]));
});

describe('ChannelModel', () => {
  describe('create', () => {
    it('creates a personal channel with the caller as owner member', async () => {
      const { channel, member } = await new ChannelModel(serverDB, ownerId).create({
        title: 'Personal',
      });

      expect(channel).toMatchObject({
        creatorId: ownerId,
        visibility: 'private',
        workspaceId: null,
      });
      expect(member).toMatchObject({
        actorType: 'user',
        channelId: channel.id,
        lastReadSequence: 0,
        role: 'owner',
        userId: ownerId,
      });
      expect(channel.id).toMatch(/^chn_/);
      expect(member.id).toMatch(/^chn_member_/);
    });

    it('creates a workspace channel and treats a blank workspace as personal', async () => {
      const { channel } = await new ChannelModel(serverDB, ownerId, workspaceId).create({
        title: 'Team',
        visibility: 'public',
      });
      const { channel: personal } = await new ChannelModel(serverDB, ownerId, ' ').create({
        title: 'Blank scope',
      });

      expect(channel).toMatchObject({ visibility: 'public', workspaceId });
      expect(personal.workspaceId).toBeNull();
    });
  });

  describe('membership-based access', () => {
    it('lets every active member read the channel, not just its creator', async () => {
      const { channel } = await new ChannelModel(serverDB, ownerId, workspaceId).create({
        title: 'Team',
      });
      await addPerson(channel.id, memberId, 'member');

      const asMember = new ChannelModel(serverDB, memberId, workspaceId);
      expect((await asMember.findAccess(channel.id))?.member.role).toBe('member');
      expect((await asMember.list()).map((item) => item.id)).toEqual([channel.id]);

      const asOutsider = new ChannelModel(serverDB, outsiderId, workspaceId);
      expect(await asOutsider.findAccess(channel.id)).toBeUndefined();
      expect(await asOutsider.list()).toEqual([]);
    });

    it('hides channels from members who left and from other scopes', async () => {
      const { channel } = await new ChannelModel(serverDB, ownerId, workspaceId).create({
        title: 'Team',
      });
      await addPerson(channel.id, memberId, 'member');
      await serverDB
        .update(channelMembers)
        .set({ active: false })
        .where(eq(channelMembers.userId, memberId));

      expect(await new ChannelModel(serverDB, memberId, workspaceId).findAccess(channel.id)).toBe(
        undefined,
      );
      expect(await new ChannelModel(serverDB, ownerId).findAccess(channel.id)).toBeUndefined();
      expect(await new ChannelModel(serverDB, ownerId).list()).toEqual([]);
    });

    it('omits archived channels from the list', async () => {
      const model = new ChannelModel(serverDB, ownerId);
      const { channel } = await model.create({ title: 'Archived' });
      await serverDB.update(channels).set({ archived: true }).where(eq(channels.id, channel.id));

      expect(await model.list()).toEqual([]);
    });
  });

  describe('write', () => {
    it('runs the mutation under the channel lock for a member with enough role', async () => {
      const { channel } = await new ChannelModel(serverDB, ownerId, workspaceId).create({
        title: 'Team',
      });
      await addPerson(channel.id, memberId, 'admin');

      const title = await new ChannelModel(serverDB, memberId, workspaceId).write(
        channel.id,
        async (tx, access) => {
          await tx.update(channels).set({ title: 'Renamed' }).where(eq(channels.id, channel.id));
          return access.channel.title;
        },
        { minRole: 'admin' },
      );

      const [renamed] = await serverDB.select().from(channels).where(eq(channels.id, channel.id));
      expect(title).toBe('Team');
      expect(renamed.title).toBe('Renamed');
    });

    it('bumps the revision once per committed write', async () => {
      const model = new ChannelModel(serverDB, ownerId);
      const { channel } = await model.create({ title: 'Personal' });

      await model.write(channel.id, async (tx) => {
        await tx.update(channels).set({ title: 'One' }).where(eq(channels.id, channel.id));
        await tx.update(channels).set({ title: 'Two' }).where(eq(channels.id, channel.id));
      });
      expect(await revisionOf(channel.id)).toBe(1);

      await expect(
        model.write(channel.id, async () => {
          throw new Error('rolled back');
        }),
      ).rejects.toThrow('rolled back');
      expect(await revisionOf(channel.id)).toBe(1);
    });

    it('rejects outsiders, insufficient roles and archived channels', async () => {
      const { channel } = await new ChannelModel(serverDB, ownerId, workspaceId).create({
        title: 'Team',
      });
      await addPerson(channel.id, memberId, 'member');
      const noop = async () => undefined;

      await expect(
        new ChannelModel(serverDB, outsiderId, workspaceId).write(channel.id, noop),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
      await expect(
        new ChannelModel(serverDB, memberId, workspaceId).write(channel.id, noop, {
          minRole: 'admin',
        }),
      ).rejects.toBeInstanceOf(ChannelError);

      await serverDB.update(channels).set({ archived: true }).where(eq(channels.id, channel.id));
      const asOwner = new ChannelModel(serverDB, ownerId, workspaceId);
      await expect(asOwner.write(channel.id, noop)).rejects.toMatchObject({ code: 'CONFLICT' });
      await expect(
        asOwner.write(channel.id, async () => 'restored', { allowArchived: true }),
      ).resolves.toBe('restored');
    });

    it.skipIf(!isServerDB)(
      'checks membership as committed by the previous lock holder',
      async () => {
        const { channel } = await new ChannelModel(serverDB, ownerId, workspaceId).create({
          title: 'Team',
        });
        await addPerson(channel.id, memberId, 'admin');

        let removed!: () => void;
        const memberRemoved = new Promise<void>((resolve) => (removed = resolve));
        let release!: () => void;
        const released = new Promise<void>((resolve) => (release = resolve));
        const removal = new ChannelModel(serverDB, ownerId, workspaceId).write(
          channel.id,
          async (tx) => {
            await tx
              .update(channelMembers)
              .set({ active: false })
              .where(eq(channelMembers.userId, memberId));
            removed();
            await released;
          },
        );

        await memberRemoved;
        const staleWrite = new ChannelModel(serverDB, memberId, workspaceId).write(
          channel.id,
          async () => 'wrote',
          { minRole: 'admin' },
        );
        // Settle the promise early so a rejection is never reported as unhandled.
        const staleResult = staleWrite.then(
          () => 'wrote',
          (error: ChannelError) => error.code,
        );
        await waitForLockWaiter();
        release();
        await removal;

        expect(await staleResult).toBe('NOT_FOUND');
      },
    );
  });

  describe('account deletion', () => {
    it('deletes personal channels and keeps workspace channels without a creator', async () => {
      const { channel: personal } = await new ChannelModel(serverDB, memberId).create({
        title: 'Personal',
      });
      const { channel: team } = await new ChannelModel(serverDB, memberId, workspaceId).create({
        title: 'Team',
      });
      await addPerson(team.id, ownerId, 'member');

      await UserModel.deleteUser(serverDB, memberId);

      const remaining = await serverDB
        .select()
        .from(channels)
        .where(inArray(channels.id, [personal.id, team.id]));
      expect(remaining).toEqual([expect.objectContaining({ creatorId: null, id: team.id })]);
      expect(
        (await new ChannelModel(serverDB, ownerId, workspaceId).findAccess(team.id))?.channel.id,
      ).toBe(team.id);
    });
  });
});
