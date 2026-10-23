// @vitest-environment node
import type { ChannelInputManifest, ChannelMemberConfig } from '@lobechat/types';
import { eq, inArray, sql } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import {
  agentOperations,
  agents,
  channelJobs,
  channelMemberGrants,
  channelMembers,
  channelMessages,
  channels,
  files,
  messages,
  messagesFiles,
  projects,
  topics,
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
    .values({ userId: ownerId, title, workspaceId })
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

const createMessage = async (channelId: string, authorMemberId: string, sequence: number) => {
  const [canonical] = await serverDB
    .insert(messages)
    .values({ channelId, content: `message ${sequence}`, role: 'user', userId: null })
    .returning();
  const [message] = await serverDB
    .insert(channelMessages)
    .values({
      authorMemberId,
      channelId,
      id: canonical.id,
      requestKey: `request-${sequence}`,
      routingStatus: 'directed',
      sequence,
    })
    .returning();
  return message;
};

const manifest = (requesterMemberId: string, memberId: string): ChannelInputManifest => ({
  cutoffSequence: 1,
  requestMessageId: 'unused',
  requesterMemberId,
  self: { memberId, name: 'Codex' },
  threadId: null,
  threadRootSequence: null,
});

/** Creates a job claimed by `agent`, holding the writer on the given device directory. */
const createClaimedJob = async (
  fixture: Awaited<ReturnType<typeof createChannel>>,
  sequence: number,
  directory: { deviceId: string; workingDirectory: string } | null = {
    deviceId: 'device-1',
    workingDirectory: '/repo',
  },
) => {
  const { agent, channel, owner } = fixture;
  const message = await createMessage(channel.id, owner.id, sequence);
  const [operation] = await serverDB
    .insert(agentOperations)
    .values({
      id: `op_${channel.id}_${sequence}`,
      channelId: channel.id,
      userId: ownerId,
      status: 'idle',
      workspaceId,
    })
    .returning();

  return serverDB
    .insert(channelJobs)
    .values({
      channelId: channel.id,
      manifest: manifest(owner.id, agent.id),
      memberId: agent.id,
      messageId: message.id,
      operationId: operation.id,
      requesterMemberId: owner.id,
      status: 'running',
      writerHeld: true,
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
  it('rejects ownerless ordinary rows and permits channel-owned rows', async () => {
    const { channel } = await createChannel();
    await expect(serverDB.insert(topics).values({ userId: null })).rejects.toThrow();
    await expect(
      serverDB.insert(messages).values({ role: 'user', userId: null }),
    ).rejects.toThrow();
    await expect(
      serverDB
        .insert(topics)
        .values({ channelId: channel.id, mode: 'channel', trigger: 'channel', userId: null }),
    ).resolves.toBeDefined();
    await expect(
      serverDB
        .insert(topics)
        .values({ channelId: channel.id, mode: 'channel', trigger: 'channel', userId: null }),
    ).rejects.toThrow();
    await expect(
      serverDB.insert(messages).values({ channelId: channel.id, role: 'user', userId: null }),
    ).resolves.toBeDefined();
  });

  it('adds the messages and topics channel constraints without validating existing rows', async () => {
    // Validation would scan both tables while 0184 holds ACCESS EXCLUSIVE on them; rows that
    // predate 0184 satisfy the constraints anyway (channel_id NULL, user_id NOT NULL).
    const constraints = await serverDB.execute(sql`
      SELECT conname, convalidated FROM pg_constraint
      WHERE conname IN (
        'messages_channel_id_channels_id_fk',
        'messages_owner_check',
        'topics_channel_id_channels_id_fk',
        'topics_owner_check'
      )
      ORDER BY conname
    `);
    expect(constraints.rows).toEqual([
      { conname: 'messages_channel_id_channels_id_fk', convalidated: false },
      { conname: 'messages_owner_check', convalidated: false },
      { conname: 'topics_channel_id_channels_id_fk', convalidated: false },
      { conname: 'topics_owner_check', convalidated: false },
    ]);

    // Unvalidated constraints still apply to every new row.
    await expect(
      serverDB.insert(messages).values({ channelId: 'missing', role: 'user', userId: null }),
    ).rejects.toThrow();
    await expect(
      serverDB.insert(topics).values({ channelId: 'missing', mode: 'channel', userId: null }),
    ).rejects.toThrow();
  });

  describe('members', () => {
    it('enforces Agent references and preserves authored history after Agent deletion', async () => {
      const { agent, channel, owner } = await createChannel();
      const [source] = await serverDB.insert(agents).values({ userId: ownerId }).returning();

      await expect(
        serverDB
          .update(channelMembers)
          .set({ agentId: 'agt_missing' })
          .where(eq(channelMembers.id, agent.id)),
      ).rejects.toThrow();
      await expect(
        serverDB
          .update(channelMembers)
          .set({ agentId: source.id })
          .where(eq(channelMembers.id, owner.id)),
      ).rejects.toThrow();
      await serverDB
        .update(channelMembers)
        .set({ agentId: source.id })
        .where(eq(channelMembers.id, agent.id));
      const message = await createMessage(channel.id, agent.id, 1);

      await serverDB.delete(agents).where(eq(agents.id, source.id));

      const [keptMember] = await serverDB
        .select()
        .from(channelMembers)
        .where(eq(channelMembers.id, agent.id));
      const [keptMessage] = await serverDB
        .select()
        .from(channelMessages)
        .where(eq(channelMessages.id, message.id));
      expect(keptMember).toMatchObject({ agentId: null, config: agentConfig, name: 'Codex' });
      expect(keptMessage.authorMemberId).toBe(agent.id);
    });

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

    it('keeps canonical attachments unique and drops them with the file', async () => {
      const first = await createChannel('First');
      const message = await createMessage(first.channel.id, first.owner.id, 1);
      const [file] = await serverDB
        .insert(files)
        .values({ fileType: 'text/plain', name: 'a.txt', size: 1, url: 'a.txt', userId: ownerId })
        .returning();
      const attach = () =>
        serverDB
          .insert(messagesFiles)
          .values({ fileId: file.id, messageId: message.id, sortOrder: 0, userId: null });

      await attach();
      await expect(attach()).rejects.toThrow();

      await serverDB.delete(files).where(eq(files.id, file.id));

      const remaining = await serverDB
        .select()
        .from(messagesFiles)
        .where(eq(messagesFiles.messageId, message.id));
      expect(remaining).toHaveLength(0);
      const [kept] = await serverDB
        .select()
        .from(channelMessages)
        .where(eq(channelMessages.id, message.id));
      expect(kept).toBeDefined();
    });
  });

  describe('writer locks', () => {
    it('allows one writer per member until it is released or isolated', async () => {
      const fixture = await createChannel();
      const [job] = await createClaimedJob(fixture, 1, null);

      await expect(createClaimedJob(fixture, 2, null)).rejects.toThrow();

      await serverDB
        .update(channelJobs)
        .set({ isolatedAt: new Date() })
        .where(eq(channelJobs.id, job.id));
      await expect(createClaimedJob(fixture, 3, null)).resolves.toHaveLength(1);
    });

    it('serializes writers on one device directory across channels', async () => {
      const first = await createChannel('First');
      const second = await createChannel('Second');
      const [job] = await createClaimedJob(first, 1);

      await expect(createClaimedJob(second, 1)).rejects.toThrow();
      await expect(
        createClaimedJob(second, 2, { deviceId: 'device-1', workingDirectory: '/other' }),
      ).resolves.toHaveLength(1);

      await serverDB
        .update(channelJobs)
        .set({ writerHeld: false })
        .where(eq(channelJobs.id, job.id));
      const third = await createChannel('Third');
      await expect(createClaimedJob(third, 1)).resolves.toHaveLength(1);
    });

    it('keeps the directory locked while an isolated writer is still unconfirmed', async () => {
      const first = await createChannel('First');
      const second = await createChannel('Second');
      const [job] = await createClaimedJob(first, 1);

      await serverDB
        .update(channelJobs)
        .set({ isolatedAt: new Date() })
        .where(eq(channelJobs.id, job.id));
      await expect(createClaimedJob(second, 1)).rejects.toThrow();

      await serverDB
        .update(channelJobs)
        .set({ writerHeld: false })
        .where(eq(channelJobs.id, job.id));
      await expect(createClaimedJob(second, 2)).resolves.toHaveLength(1);
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
    it('validates project associations and preserves history when the project is deleted', async () => {
      const { channel, owner } = await createChannel();
      expect(channel.projectId).toBeNull();
      const message = await createMessage(channel.id, owner.id, 1);
      await expect(
        serverDB
          .update(channels)
          .set({ projectId: 'prj_missing' })
          .where(eq(channels.id, channel.id)),
      ).rejects.toThrow();

      const [project] = await serverDB
        .insert(projects)
        .values({ name: 'Channel project', userId: ownerId, workspaceId })
        .returning();
      const [linked] = await serverDB
        .update(channels)
        .set({ projectId: project.id })
        .where(eq(channels.id, channel.id))
        .returning();
      expect(linked.projectId).toBe(project.id);

      await serverDB.delete(projects).where(eq(projects.id, project.id));

      const [kept] = await serverDB.select().from(channels).where(eq(channels.id, channel.id));
      expect(kept).toMatchObject({ id: channel.id, projectId: null, userId: ownerId, workspaceId });
      expect(
        await serverDB.select().from(channelMessages).where(eq(channelMessages.id, message.id)),
      ).toHaveLength(1);
    });

    it('deletes a channel with all of its rows but keeps its operations', async () => {
      const fixture = await createChannel();
      const [job] = await createClaimedJob(fixture, 1);

      await serverDB.delete(channels).where(eq(channels.id, fixture.channel.id));

      const members = await serverDB
        .select()
        .from(channelMembers)
        .where(eq(channelMembers.channelId, fixture.channel.id));
      const jobs = await serverDB
        .select()
        .from(channelJobs)
        .where(eq(channelJobs.channelId, fixture.channel.id));
      expect(members).toHaveLength(0);
      expect(jobs).toHaveLength(0);
      // Usage history outlives the channel, and the stale id keeps it out of ordinary reads.
      const [operation] = await serverDB
        .select()
        .from(agentOperations)
        .where(eq(agentOperations.id, job.operationId!));
      expect(operation).toMatchObject({ channelId: fixture.channel.id });
    });
  });
});
