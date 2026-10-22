// @vitest-environment node
import type { ChannelInputManifest, ChannelMemberConfig } from '@lobechat/types';
import { eq, inArray } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import {
  channelJobs,
  channelMemberGrants,
  channelMembers,
  channelMessages,
  channelRuns,
  channels,
  channelSessions,
  users,
  workspaces,
} from '..';

const serverDB = await getTestDB();
const ownerId = 'channel-schema-owner';
const otherId = 'channel-schema-other';
const workspaceId = 'channel-schema-workspace';

const agentConfig: ChannelMemberConfig = {
  deviceId: 'device-1',
  deviceOwnerId: ownerId,
  model: 'gpt-5',
  provider: 'openai',
  runtime: 'codex',
  workingDirectory: '/repo',
};

const createChannel = async (title = 'Channel') => {
  const [channel] = await serverDB
    .insert(channels)
    .values({ creatorId: ownerId, title, workspaceId })
    .returning();
  const [owner] = await serverDB
    .insert(channelMembers)
    .values({ actorType: 'user', channelId: channel.id, role: 'owner', userId: ownerId })
    .returning();
  const [agent] = await serverDB
    .insert(channelMembers)
    .values({ actorType: 'agent', channelId: channel.id, config: agentConfig, name: 'Codex' })
    .returning();

  return { agent, channel, owner };
};

const revisionOf = async (channelId: string) => {
  const [row] = await serverDB
    .select({ revision: channels.revision })
    .from(channels)
    .where(eq(channels.id, channelId));
  return row.revision;
};

const createMessage = async (channelId: string, authorMemberId: string, sequence: number) => {
  const [message] = await serverDB
    .insert(channelMessages)
    .values({
      authorMemberId,
      channelId,
      content: `message ${sequence}`,
      requestKey: `request-${sequence}`,
      routingStatus: 'directed',
      sequence,
    })
    .returning();
  return message;
};

const manifest = (requesterMemberId: string, memberId: string): ChannelInputManifest => ({
  cutoffSequence: 1,
  messages: [],
  requestMessageId: 'unused',
  requesterMemberId,
  self: { memberId, name: 'Codex' },
  sessionGeneration: 1,
  source: 'reconstructed',
  threadId: null,
  threadRootSequence: null,
});

/** Creates a job and a claimed run for `agent` on the given device directory. */
const createRun = async (
  fixture: Awaited<ReturnType<typeof createChannel>>,
  sequence: number,
  directory: { deviceId: string; workingDirectory: string } | null = {
    deviceId: 'device-1',
    workingDirectory: '/repo',
  },
) => {
  const { agent, channel, owner } = fixture;
  const message = await createMessage(channel.id, owner.id, sequence);
  const [job] = await serverDB
    .insert(channelJobs)
    .values({
      channelId: channel.id,
      memberId: agent.id,
      messageId: message.id,
      requesterMemberId: owner.id,
    })
    .returning();
  const [session] = await serverDB
    .insert(channelSessions)
    .values({ channelId: channel.id, memberId: agent.id, scope: `main-${sequence}` })
    .returning();

  return serverDB
    .insert(channelRuns)
    .values({
      channelId: channel.id,
      jobId: job.id,
      manifest: manifest(owner.id, agent.id),
      memberId: agent.id,
      requesterMemberId: owner.id,
      sessionId: session.id,
      ...directory,
    })
    .returning();
};

beforeEach(async () => {
  await serverDB.insert(users).values([{ id: ownerId }, { id: otherId }]);
  await serverDB
    .insert(workspaces)
    .values({ id: workspaceId, name: 'Workspace', primaryOwnerId: ownerId, slug: workspaceId });
});

afterEach(async () => {
  await serverDB.delete(workspaces).where(eq(workspaces.id, workspaceId));
  await serverDB.delete(users).where(inArray(users.id, [ownerId, otherId]));
});

describe('channel schema', () => {
  describe('members', () => {
    it('keeps people and Agents in one member table with their own fields', async () => {
      const { agent, owner } = await createChannel();

      expect(owner).toMatchObject({ actorType: 'user', config: null, role: 'owner' });
      expect(agent).toMatchObject({ actorType: 'agent', config: agentConfig, role: null });
    });

    it('rejects members whose fields do not match their actor type', async () => {
      const { channel } = await createChannel();

      await expect(
        serverDB
          .insert(channelMembers)
          .values({ actorType: 'user', channelId: channel.id, userId: otherId }),
      ).rejects.toThrow();
      await expect(
        serverDB
          .insert(channelMembers)
          .values({ actorType: 'agent', channelId: channel.id, name: 'No config' }),
      ).rejects.toThrow();
      await expect(
        serverDB.insert(channelMembers).values({
          actorType: 'agent',
          channelId: channel.id,
          config: agentConfig,
          name: 'Agent with a person',
          userId: otherId,
        }),
      ).rejects.toThrow();
    });

    it('lets a person join a channel only once', async () => {
      const { channel } = await createChannel();

      await expect(
        serverDB
          .insert(channelMembers)
          .values({ actorType: 'user', channelId: channel.id, role: 'member', userId: ownerId }),
      ).rejects.toThrow();
    });

    it('keeps the authored history when a member deletes their account', async () => {
      const { channel } = await createChannel();
      const [other] = await serverDB
        .insert(channelMembers)
        .values({ actorType: 'user', channelId: channel.id, role: 'member', userId: otherId })
        .returning();
      const message = await createMessage(channel.id, other.id, 1);

      await serverDB.delete(users).where(eq(users.id, otherId));

      const [member] = await serverDB
        .select()
        .from(channelMembers)
        .where(eq(channelMembers.id, other.id));
      const [kept] = await serverDB
        .select()
        .from(channelMessages)
        .where(eq(channelMessages.id, message.id));
      expect(member.userId).toBeNull();
      expect(kept.authorMemberId).toBe(other.id);
    });
  });

  describe('messages', () => {
    it('rejects a retried request key and an author from another channel', async () => {
      const first = await createChannel('First');
      const second = await createChannel('Second');
      await createMessage(first.channel.id, first.owner.id, 1);

      await expect(createMessage(first.channel.id, first.owner.id, 1)).rejects.toThrow();
      await expect(createMessage(first.channel.id, second.owner.id, 2)).rejects.toThrow();
    });
  });

  describe('runs', () => {
    it('allows one writer per member until it is released or isolated', async () => {
      const fixture = await createChannel();
      const [run] = await createRun(fixture, 1, null);

      await expect(createRun(fixture, 2, null)).rejects.toThrow();

      await serverDB
        .update(channelRuns)
        .set({ isolatedAt: new Date() })
        .where(eq(channelRuns.id, run.id));
      await expect(createRun(fixture, 3, null)).resolves.toHaveLength(1);
    });

    it('serializes runs on one device directory across channels', async () => {
      const first = await createChannel('First');
      const second = await createChannel('Second');
      const [run] = await createRun(first, 1);

      await expect(createRun(second, 1)).rejects.toThrow();
      await expect(
        createRun(second, 2, { deviceId: 'device-1', workingDirectory: '/other' }),
      ).resolves.toHaveLength(1);

      await serverDB
        .update(channelRuns)
        .set({ physicalStopped: true, writerReleased: true })
        .where(eq(channelRuns.id, run.id));
      const third = await createChannel('Third');
      await expect(createRun(third, 1)).resolves.toHaveLength(1);
    });

    it('keeps the directory locked while an isolated run is still unconfirmed', async () => {
      const first = await createChannel('First');
      const second = await createChannel('Second');
      const [run] = await createRun(first, 1);

      await serverDB
        .update(channelRuns)
        .set({ isolatedAt: new Date() })
        .where(eq(channelRuns.id, run.id));
      await expect(createRun(second, 1)).rejects.toThrow();

      await serverDB
        .update(channelRuns)
        .set({ physicalStopped: true, writerReleased: true })
        .where(eq(channelRuns.id, run.id));
      await expect(createRun(second, 2)).resolves.toHaveLength(1);
    });
  });

  describe('grants', () => {
    it('binds one grant to each environment revision of a member', async () => {
      const { agent, channel, owner } = await createChannel();
      const grant = {
        channelId: channel.id,
        deviceId: 'device-1',
        deviceOwnerId: otherId,
        environmentRevision: 0,
        memberId: agent.id,
        requestedByMemberId: owner.id,
        workingDirectory: '/repo',
      };

      const [created] = await serverDB.insert(channelMemberGrants).values(grant).returning();
      expect(created.status).toBe('pending');
      await expect(serverDB.insert(channelMemberGrants).values(grant)).rejects.toThrow();
      await expect(
        serverDB.insert(channelMemberGrants).values({ ...grant, environmentRevision: 1 }),
      ).resolves.toBeDefined();
    });
  });

  describe('channels', () => {
    it('leaves the revision to the channel write path', async () => {
      // Child writes must not lock the channel row behind the caller's back: a device
      // receipt that locked a run first and the channel second would deadlock against
      // a writer holding the channel lock.
      const fixture = await createChannel();
      const [run] = await createRun(fixture, 1);
      await serverDB
        .update(channelRuns)
        .set({ acceptance: 'accepted', status: 'running' })
        .where(eq(channelRuns.id, run.id));

      expect(await revisionOf(fixture.channel.id)).toBe(0);
    });

    it('deletes a channel with all of its rows', async () => {
      const fixture = await createChannel();
      await createRun(fixture, 1);

      await serverDB.delete(channels).where(eq(channels.id, fixture.channel.id));

      const members = await serverDB
        .select()
        .from(channelMembers)
        .where(eq(channelMembers.channelId, fixture.channel.id));
      const runs = await serverDB
        .select()
        .from(channelRuns)
        .where(eq(channelRuns.channelId, fixture.channel.id));
      expect(members).toHaveLength(0);
      expect(runs).toHaveLength(0);
    });
  });
});
