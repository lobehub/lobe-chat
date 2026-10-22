// @vitest-environment node
import { eq, inArray } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { channelMembers, channels, users, workspaces } from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { ChannelError, ChannelModel } from '../channel';

const serverDB: LobeChatDatabase = await getTestDB();

const ownerId = 'channel-model-owner';
const memberId = 'channel-model-member';
const outsiderId = 'channel-model-outsider';
const workspaceId = 'channel-model-workspace';

const addPerson = async (channelId: string, userId: string, role: 'admin' | 'member') =>
  serverDB.insert(channelMembers).values({ actorType: 'user', channelId, role, userId });

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
  });
});
