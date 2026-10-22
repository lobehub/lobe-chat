// @vitest-environment node
import { eq, sql } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../../core/getTestDB';
import { channelJobs, channelMessages, channels, channelSessions } from '../../../schemas';
import type { LobeChatDatabase } from '../../../type';
import { ChannelExecutionModel } from '..';
import { claimJob } from '../claim';
import { lockChannel } from '../transaction';
import { createChannelFixture, deviceConfig, jobsOf, lease, runById } from './testUtils';

const db: LobeChatDatabase = await getTestDB();
const fixture = createChannelFixture(db, 'channel-execution');
const execution = new ChannelExecutionModel(db);
// Racing transactions need separate connections; PGlite runs them one after another.
const isServerDB = process.env.TEST_SERVER_DB === '1';

/** Resolves once some session in this database is waiting on a lock. */
const waitForLockWaiter = async () => {
  for (let attempt = 0; attempt < 100; attempt++) {
    const { rows } = await db.execute<{ waiting: number }>(
      sql`SELECT count(*)::int AS waiting FROM pg_stat_activity
          WHERE datname = current_database() AND wait_event_type = 'Lock'`,
    );
    if (rows[0]?.waiting) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error('No transaction started waiting for a lock');
};

beforeEach(fixture.setup);
afterEach(fixture.cleanup);

/** A team channel with one Agent and a message mentioning it. */
const mentionAgent = async (config = deviceConfig()) => {
  const team = await fixture.createTeamChannel();
  const agent = await fixture.addAgent(team.channel.id, 'Coder', config);
  const message = await team.asMember.send(team.channel.id, {
    content: 'Fix it',
    mentions: [agent.id],
    requestKey: 'req-1',
    routing: 'jev',
  });
  const [job] = await jobsOf(db, message.id);

  return { ...team, agent, job, message };
};

const jobById = async (jobId: string) => {
  const [job] = await db.select().from(channelJobs).where(eq(channelJobs.id, jobId));
  return job;
};

describe('ChannelExecutionModel', () => {
  it('claims, accepts, publishes and releases a run', async () => {
    const { agent, channel, job, member, message } = await mentionAgent();

    const claim = await execution.claim(channel.id, job.id, lease);
    expect(claim?.run).toMatchObject({
      deviceId: 'device-1',
      leaseOwner: 'worker-1',
      requesterMemberId: member.id,
      workingDirectory: '/repo',
    });
    expect(claim?.run.manifest).toMatchObject({
      cutoffSequence: 1,
      requestMessageId: message.id,
      requesterMemberId: member.id,
      self: { memberId: agent.id, name: 'Coder' },
      source: 'reconstructed',
    });
    expect(claim?.run.manifest.messages).toEqual([
      expect.objectContaining({ author: { id: member.id, name: 'mia', type: 'user' } }),
    ]);
    expect((await jobById(job.id)).status).toBe('running');

    const { run } = claim!;
    await execution.accepted(channel.id, run.id, run.fence, { nativeSessionId: 'session-1' });
    const [session] = await db
      .select()
      .from(channelSessions)
      .where(eq(channelSessions.id, run.sessionId));
    expect(session).toMatchObject({ acceptedSequence: 1, nativeSessionId: 'session-1' });

    await execution.saveDraft(channel.id, run.id, run.fence, 'Fixed');
    await expect(
      execution.saveDraft(channel.id, run.id, run.fence, 'Changed'),
    ).rejects.toMatchObject({ code: 'CONFLICT' });

    const replyId = await execution.publish(channel.id, run.id, run.fence);
    expect(await execution.publish(channel.id, run.id, run.fence)).toBe(replyId);
    const [reply] = await db.select().from(channelMessages).where(eq(channelMessages.id, replyId));
    expect(reply).toMatchObject({
      authorMemberId: agent.id,
      content: 'Fixed',
      replyToId: message.id,
      routingStatus: 'reply',
      sequence: 2,
    });
    expect((await jobById(job.id)).status).toBe('completed');

    await execution.releaseWriter(channel.id, run.id, run.fence);
    expect(await runById(db, run.id)).toMatchObject({
      leaseOwner: null,
      status: 'completed',
      writerReleased: true,
    });
  });

  it('gives an existing session only the messages it has not accepted', async () => {
    const { agent, asMember, channel, job } = await mentionAgent();
    const first = (await execution.claim(channel.id, job.id, lease))!.run;
    await execution.accepted(channel.id, first.id, first.fence, { nativeSessionId: 'session-1' });
    await execution.saveDraft(channel.id, first.id, first.fence, 'Done');
    await execution.publish(channel.id, first.id, first.fence);
    await execution.releaseWriter(channel.id, first.id, first.fence);

    const next = await asMember.send(channel.id, {
      content: 'Again',
      mentions: [agent.id],
      requestKey: 'req-2',
      routing: 'jev',
    });
    const [nextJob] = await jobsOf(db, next.id);
    const second = (await execution.claim(channel.id, nextJob.id, lease))!.run;

    expect(second.manifest.source).toBe('incremental');
    expect(second.manifest.messages.map((m) => m.sequence)).toEqual([2, 3]);
  });

  it('answers in message order and holds one writer per member', async () => {
    const { agent, asMember, channel, job } = await mentionAgent();
    const next = await asMember.send(channel.id, {
      content: 'Second',
      mentions: [agent.id],
      requestKey: 'req-2',
      routing: 'jev',
    });
    const [nextJob] = await jobsOf(db, next.id);

    expect(await execution.claim(channel.id, nextJob.id, lease)).toBeNull();
    const run = (await execution.claim(channel.id, job.id, lease))!.run;
    expect(await execution.claim(channel.id, nextJob.id, lease)).toBeNull();

    await execution.fail(channel.id, run.id, run.fence, { message: 'boom', notSubmitted: true });
    expect((await jobById(job.id)).status).toBe('failed');
    expect(await execution.claim(channel.id, nextJob.id, lease)).not.toBeNull();
  });

  it('blocks a job while another channel uses the same device directory', async () => {
    const first = await mentionAgent();
    const run = (await execution.claim(first.channel.id, first.job.id, lease))!.run;

    const asOther = await fixture.createTeamChannel('Other');
    const otherAgent = await fixture.addAgent(asOther.channel.id, 'Coder', deviceConfig());
    const message = await asOther.asMember.send(asOther.channel.id, {
      content: 'Same repo',
      mentions: [otherAgent.id],
      requestKey: 'req-1',
      routing: 'jev',
    });
    const [job] = await jobsOf(db, message.id);

    expect(await execution.claim(asOther.channel.id, job.id, lease)).toBeNull();
    expect(await jobById(job.id)).toMatchObject({ blockedCode: 'directory_locked' });

    // Isolation lets the member move on but does not free the directory.
    await execution.isolate(first.channel.id, run.id, run.fence, 'termination unconfirmed');
    expect(await execution.claim(asOther.channel.id, job.id, lease)).toBeNull();

    await execution.releaseWriter(first.channel.id, run.id, run.fence);
    expect(await execution.claim(asOther.channel.id, job.id, lease)).not.toBeNull();
    expect(await jobById(job.id)).toMatchObject({ blockedCode: null, status: 'running' });
  });

  it.skipIf(!isServerDB)(
    'blocks the loser of a concurrent claim on the same directory',
    async () => {
      const first = await mentionAgent();
      const other = await fixture.createTeamChannel('Other');
      const otherAgent = await fixture.addAgent(other.channel.id, 'Coder', deviceConfig());
      const message = await other.asMember.send(other.channel.id, {
        content: 'Same repo',
        mentions: [otherAgent.id],
        requestKey: 'req-1',
        routing: 'jev',
      });
      const [job] = await jobsOf(db, message.id);

      // The first claim inserts its run but has not committed when the second one checks.
      let inserted!: () => void;
      const runInserted = new Promise<void>((resolve) => (inserted = resolve));
      let release!: () => void;
      const released = new Promise<void>((resolve) => (release = resolve));
      const winner = db.transaction(async (tx) => {
        const channel = await lockChannel(tx, first.channel.id);
        await claimJob(tx, channel, first.job.id, lease);
        inserted();
        await released;
      });

      await runInserted;
      const loser = execution.claim(other.channel.id, job.id, lease);
      await waitForLockWaiter();
      release();
      await winner;

      expect(await loser).toBeNull();
      expect(await jobById(job.id)).toMatchObject({
        blockedCode: 'directory_locked',
        status: 'queued',
      });
    },
  );

  it('fails the job when the writer ends without a reply', async () => {
    const { channel, job } = await mentionAgent();
    const run = (await execution.claim(channel.id, job.id, lease))!.run;
    await execution.accepted(channel.id, run.id, run.fence, { nativeSessionId: 's' });

    await execution.releaseWriter(channel.id, run.id, run.fence);

    expect(await runById(db, run.id)).toMatchObject({
      publicationRevoked: true,
      status: 'failed',
      writerReleased: true,
    });
    expect((await jobById(job.id)).status).toBe('failed');
  });

  it('settles the job of an unknown execution without redelivering it', async () => {
    const { channel, job } = await mentionAgent();
    const run = (await execution.claim(channel.id, job.id, lease))!.run;
    await execution.executionUnknown(channel.id, run.id, run.fence, 'receipt lost');

    await execution.releaseWriter(channel.id, run.id, run.fence);

    expect(await runById(db, run.id)).toMatchObject({
      status: 'execution_unknown',
      writerReleased: true,
    });
    expect((await jobById(job.id)).status).toBe('failed');
  });

  it('keeps an accepted draft publishable after the writer is released', async () => {
    const { channel, job } = await mentionAgent();
    const run = (await execution.claim(channel.id, job.id, lease))!.run;
    await execution.accepted(channel.id, run.id, run.fence, { nativeSessionId: 's' });
    await execution.saveDraft(channel.id, run.id, run.fence, 'Done');

    await execution.releaseWriter(channel.id, run.id, run.fence);
    expect(await runById(db, run.id)).toMatchObject({ status: 'running', writerReleased: true });
    expect((await jobById(job.id)).status).toBe('running');

    await execution.publish(channel.id, run.id, run.fence);
    expect((await runById(db, run.id)).status).toBe('completed');
    expect((await jobById(job.id)).status).toBe('completed');
  });

  it('refuses stale fences and archived channels', async () => {
    const { channel, job } = await mentionAgent();
    const run = (await execution.claim(channel.id, job.id, lease))!.run;

    await expect(
      execution.accepted(channel.id, run.id, run.fence + 1, { nativeSessionId: 's' }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
    await expect(execution.publish(channel.id, run.id, run.fence)).rejects.toMatchObject({
      code: 'CONFLICT',
    });

    await execution.fail(channel.id, run.id, run.fence, { message: 'boom', notSubmitted: true });
    await db.update(channels).set({ archived: true }).where(eq(channels.id, channel.id));
    const [rerun] = await db
      .insert(channelJobs)
      .values({ ...job, deliveryKey: 'retry', id: undefined, status: 'queued' })
      .returning();
    expect(await execution.claim(channel.id, rerun.id, lease)).toBeNull();
  });

  it('renews the lease only for the live owner', async () => {
    const { channel, job } = await mentionAgent();
    const run = (await execution.claim(channel.id, job.id, lease))!.run;

    expect(await execution.heartbeat(run.id, run.fence, lease)).toBe(true);
    expect(await execution.heartbeat(run.id, run.fence, { ...lease, leaseOwner: 'other' })).toBe(
      false,
    );

    await execution.fail(channel.id, run.id, run.fence, { message: 'boom', notSubmitted: true });
    expect(await execution.heartbeat(run.id, run.fence, lease)).toBe(false);
  });
});
