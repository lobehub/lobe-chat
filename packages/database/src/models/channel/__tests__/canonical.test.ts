// @vitest-environment node
import { and, eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../../core/getTestDB';
import {
  agentOperations,
  agents,
  channelMembers,
  channelRuns,
  channelSessions,
  channelThreads,
  messages,
  topics,
  users,
  workspaces,
} from '../../../schemas';
import { ChannelExecutionModel } from '..';
import { createChannelFixture, deviceConfig, jobsOf, lease, nativeConfig } from './testUtils';

const db = await getTestDB();
const fixture = createChannelFixture(db, 'channel-canonical');
const execution = new ChannelExecutionModel(db);
beforeEach(fixture.setup);
afterEach(fixture.cleanup);

const setup = async (config = nativeConfig) => {
  const team = await fixture.createTeamChannel();
  const agent = await fixture.addAgent(team.channel.id, 'Agent', config);
  let counter = 0;
  const claim = async (owner = false, threadId?: string) => {
    const message = await (owner ? team.asOwner : team.asMember).send(team.channel.id, {
      content: `Request ${++counter}`,
      mentions: [agent.id],
      requestKey: `request-${counter}`,
      routing: 'fallback',
      threadId,
    });
    const [job] = await jobsOf(db, message.id);
    return (await execution.claim(team.channel.id, job.id, lease))!;
  };
  const finish = async (claimed: Awaited<ReturnType<typeof claim>>) => {
    await execution.accepted(team.channel.id, claimed.run.id, claimed.run.fence, {});
    await execution.saveDraft(team.channel.id, claimed.run.id, claimed.run.fence, 'Final answer');
    await execution.releaseWriter(team.channel.id, claimed.run.id, claimed.run.fence);
  };
  return { ...team, agent, claim, finish };
};

const operationOf = async (id: string) =>
  (await db.select().from(agentOperations).where(eq(agentOperations.id, id)))[0];

describe('canonical channel persistence', () => {
  it('attributes operations to the member Agent reference', async () => {
    const team = await setup();
    const [source] = await db.insert(agents).values({ userId: fixture.ownerId }).returning();
    await db
      .update(channelMembers)
      .set({ agentId: source.id })
      .where(eq(channelMembers.id, team.agent.id));

    const claim = await team.claim();

    expect(await operationOf(claim.run.operationId)).toMatchObject({
      agentId: source.id,
      userId: fixture.memberId,
    });
  });

  it.each([nativeConfig, deviceConfig()])(
    'creates an operation with the actual requester for $runtime',
    async (config) => {
      const team = await setup(config);
      const claim = await team.claim();
      expect(claim.topic).toMatchObject({
        channelId: team.channel.id,
        userId: fixture.memberId,
        agentId: null,
        mode: 'channel_runtime',
        trigger: 'channel',
      });
      expect(await operationOf(claim.run.operationId)).toMatchObject({
        userId: fixture.memberId,
        channelId: team.channel.id,
        workspaceId: fixture.workspaceId,
        topicId: claim.topic.id,
        model: config.model,
        provider: config.provider,
        trigger: 'channel',
      });
      expect(claim.run.operationId).toMatch(/^op_/);
    },
  );

  it('reuses native context without a CLI id and excludes private transcript from manifests', async () => {
    const team = await setup();
    const first = await team.claim();
    await db.insert(messages).values({
      channelId: team.channel.id,
      topicId: first.topic.id,
      userId: fixture.memberId,
      role: 'assistant',
      content: 'PRIVATE transcript',
    });
    await team.finish(first);
    expect((await operationOf(first.run.operationId)).status).toBe('done');
    // Physical release may precede publication, and only the saved final answer is published.
    await execution.publish(team.channel.id, first.run.id, first.run.fence);
    const second = await team.claim();
    expect(second.topic.id).toBe(first.topic.id);
    expect(second.session.id).toBe(first.session.id);
    expect(second.run.manifest.source).toBe('incremental');
    expect(second.run.manifest.messages.map((message) => message.content)).toEqual([
      'Final answer',
      'Request 2',
    ]);
    await execution.accepted(team.channel.id, first.run.id, first.run.fence, {});
    await execution.fail(team.channel.id, first.run.id, first.run.fence, {
      message: 'Late failure',
    });
    expect((await operationOf(first.run.operationId)).status).toBe('done');
  });

  it.each(['principal', 'environment', 'isolation', 'deleted topic', 'branch'])(
    'rotates context for %s and preserves old run identity',
    async (reason) => {
      const team = await setup();
      const first = await team.claim();
      if (reason === 'isolation')
        await execution.isolate(team.channel.id, first.run.id, first.run.fence, 'lost worker');
      else await team.finish(first);
      if (reason === 'environment')
        await db
          .update(channelMembers)
          .set({ environmentRevision: 1 })
          .where(eq(channelMembers.id, team.agent.id));
      if (reason === 'deleted topic') await db.delete(topics).where(eq(topics.id, first.topic.id));
      let threadId: string | undefined;
      if (reason === 'branch') {
        const [thread] = await db
          .insert(channelThreads)
          .values({
            channelId: team.channel.id,
            rootMessageId: first.run.manifest.requestMessageId,
            rootSequence: 1,
            followerMemberIds: [team.agent.id],
          })
          .returning();
        threadId = thread.id;
      }
      const second = await team.claim(reason === 'principal', threadId);
      expect(second.topic.id).not.toBe(first.topic.id);
      expect(second.session.acceptedSequence).toBe(0);
      expect(second.run.manifest.source).toBe('reconstructed');
      const [oldSession] = await db
        .select()
        .from(channelSessions)
        .where(eq(channelSessions.id, first.session.id));
      expect(oldSession.topicId).toBe(reason === 'deleted topic' ? null : first.topic.id);
      expect((await operationOf(first.run.operationId)).topicId).toBe(
        reason === 'deleted topic' ? null : first.topic.id,
      );
    },
  );

  it('merges hetero resume metadata and requires a resume id for incremental input', async () => {
    const team = await setup(deviceConfig());
    const first = await team.claim();
    await db
      .update(topics)
      .set({ metadata: { model: 'preserved-model' } })
      .where(eq(topics.id, first.topic.id));
    await team.finish(first);
    const second = await team.claim();
    expect(second.topic.id).toBe(first.topic.id);
    expect(second.run.manifest.source).toBe('reconstructed');
    await execution.accepted(team.channel.id, second.run.id, second.run.fence, {
      nativeSessionId: 'cli-resume',
    });
    await team.finish(second);
    const third = await team.claim();
    expect(third.topic.metadata).toMatchObject({
      model: 'preserved-model',
      heteroSessionId: 'cli-resume',
    });
    expect(third.run.manifest.source).toBe('incremental');
  });

  it('does not create an operation for a blocked directory claim', async () => {
    const first = await setup(deviceConfig());
    await first.claim();
    const second = await setup(deviceConfig());
    expect(await second.claim()).toBeNull();
    expect(
      await db
        .select()
        .from(agentOperations)
        .where(eq(agentOperations.channelId, second.channel.id)),
    ).toHaveLength(0);
  });

  it('preserves the public timeline when its creator account is deleted', async () => {
    const team = await setup();
    const claim = await team.claim(true);
    await db
      .update(workspaces)
      .set({ primaryOwnerId: fixture.memberId })
      .where(eq(workspaces.id, fixture.workspaceId));
    await db.delete(users).where(eq(users.id, fixture.ownerId));
    const [publicTopic] = await db
      .select()
      .from(topics)
      .where(and(eq(topics.channelId, team.channel.id), eq(topics.mode, 'channel')));
    expect(publicTopic.userId).toBeNull();
    expect(
      await db.select().from(messages).where(eq(messages.id, claim.run.manifest.requestMessageId)),
    ).toHaveLength(1);
  });

  it('does not resurrect an operation already completed by the runtime', async () => {
    const team = await setup();
    const claim = await team.claim();
    await db
      .update(agentOperations)
      .set({ status: 'done', totalTokens: 42, traceS3Key: 'trace' })
      .where(eq(agentOperations.id, claim.run.operationId));
    await execution.accepted(team.channel.id, claim.run.id, claim.run.fence, {});
    await execution.fail(team.channel.id, claim.run.id, claim.run.fence, { message: 'late' });
    expect(
      (await db.select().from(channelRuns).where(eq(channelRuns.id, claim.run.id)))[0],
    ).toMatchObject({
      publicationRevoked: false,
      status: 'running',
    });
    expect(await operationOf(claim.run.operationId)).toMatchObject({
      status: 'done',
      totalTokens: 42,
      traceS3Key: 'trace',
    });
  });
});
