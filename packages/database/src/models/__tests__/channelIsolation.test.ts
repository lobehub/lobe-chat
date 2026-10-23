// @vitest-environment node
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { ChannelExecutionRepository, ChannelRepository } from '../../repositories/channel';
import {
  createChannelFixture,
  jobsOf,
  lease,
} from '../../repositories/channel/__tests__/testUtils';
import type { FtsSearchBackendScope } from '../../repositories/ftsSearch';
import { FtsSearchRepo, PgLikeFtsSearchBackend } from '../../repositories/ftsSearch';
import { pgLikeDialect } from '../../repositories/ftsSearch/pgLike/dialect';
import { PostgresFtsSearchBackend } from '../../repositories/ftsSearch/postgres/backend';
import { FtsSearchDocumentBuilder } from '../../repositories/ftsSearchDocument/builder';
import {
  agentOperations,
  files,
  messagePlugins,
  messages,
  messagesFiles,
  topics,
} from '../../schemas';
import { AgentOperationModel } from '../agentOperation';
import { MessageModel } from '../message';
import { TopicModel } from '../topic';
import { TopicShareModel } from '../topicShare';

const db = await getTestDB();
const fixture = createChannelFixture(db, 'channel-isolation');
beforeEach(fixture.setup);
afterEach(fixture.cleanup);

const setup = async () => {
  const team = await fixture.createTeamChannel('boundarytoken public');
  const agent = await fixture.addAgent(team.channel.id, 'Agent');
  const publicMessage = await team.asMember.send(team.channel.id, {
    content: 'boundarytoken public message',
    mentions: [agent.id],
    requestKey: 'request',
    routing: 'fallback',
  });
  const [job] = await jobsOf(db, publicMessage.id);
  const claim = (await new ChannelExecutionRepository(db).claim(team.channel.id, job.id, lease))!;
  await db
    .update(topics)
    .set({ title: 'boundarytoken private' })
    .where(eq(topics.id, claim.topic.id));
  const runtime = new MessageModel(db, fixture.memberId, fixture.workspaceId, undefined, {
    channelId: team.channel.id,
  });
  const privateMessage = await runtime.create({
    content: 'boundarytoken secret',
    role: 'assistant',
    topicId: claim.topic.id,
  });
  const legacyTopics = new TopicModel(db, fixture.memberId, fixture.workspaceId);
  const legacyTopic = await legacyTopics.create({ title: 'boundarytoken ordinary' });
  const legacyMessages = new MessageModel(db, fixture.memberId, fixture.workspaceId);
  const legacyMessage = await legacyMessages.create({
    content: 'ordinary',
    role: 'user',
    topicId: legacyTopic.id,
  });
  return {
    ...team,
    claim,
    legacyMessage,
    legacyMessages,
    legacyTopic,
    legacyTopics,
    privateMessage,
    publicMessage,
    runtime,
  };
};

describe('Channel compatibility with ordinary conversation APIs', () => {
  it('hides public and private Channel data from workspace and personal models, preserving ordinary chat', async () => {
    const state = await setup();
    for (const userId of [fixture.ownerId, fixture.memberId]) {
      for (const workspaceId of [undefined, fixture.workspaceId]) {
        const messageModel = new MessageModel(db, userId, workspaceId);
        const topicModel = new TopicModel(db, userId, workspaceId);
        expect(await messageModel.findById(state.publicMessage.id)).toBeUndefined();
        expect(await messageModel.findById(state.privateMessage.id)).toBeUndefined();
        expect(await topicModel.findById(state.claim.topic.id)).toBeUndefined();
        expect(await messageModel.query({ topicId: state.claim.topic.id })).toEqual([]);
        expect(
          await new AgentOperationModel(db, userId, workspaceId).findById(
            state.claim.job.operationId!,
          ),
        ).toBeNull();
      }
    }
    expect(await state.legacyMessages.findById(state.legacyMessage.id)).toMatchObject({
      content: 'ordinary',
    });
    expect(await state.legacyTopics.findById(state.legacyTopic.id)).toMatchObject({
      userId: fixture.memberId,
    });
    expect(await state.legacyMessages.count()).toBe(1);
    const memories = await state.legacyTopics.listTopicsForMemoryExtractor({
      ignoreExtracted: true,
    });
    expect(memories.map((row) => row.id)).toEqual([state.legacyTopic.id]);
  });

  it('allows only the trusted runtime and execution principal to read/write private context', async () => {
    const state = await setup();
    expect(await state.runtime.findById(state.privateMessage.id)).toMatchObject({
      content: 'boundarytoken secret',
    });
    await state.runtime.update(state.privateMessage.id, {
      content: 'runtime update',
      usage: { totalTokens: 17 },
    });
    expect(
      (await db.select().from(topics).where(eq(topics.id, state.claim.topic.id)))[0].totalTokens,
    ).toBe(17);
    const otherPrincipal = new MessageModel(db, fixture.ownerId, fixture.workspaceId, undefined, {
      channelId: state.channel.id,
    });
    expect(await otherPrincipal.findById(state.privateMessage.id)).toBeUndefined();
    expect(await otherPrincipal.update(state.privateMessage.id, { content: 'forged' })).toEqual({
      success: false,
    });
    expect(await state.runtime.findById(state.legacyMessage.id)).toBeUndefined();
    expect(await state.runtime.findById(state.publicMessage.id)).toBeUndefined();
    const operations = new AgentOperationModel(db, fixture.memberId, fixture.workspaceId, {
      channelId: state.channel.id,
    });
    expect(await operations.findById(state.claim.job.operationId!)).toMatchObject({
      topicId: state.claim.topic.id,
    });
    await operations.recordStart({
      operationId: state.claim.job.operationId!,
      topicId: state.claim.topic.id,
      maxSteps: 20,
      modelRuntimeConfig: { test: true },
      trigger: 'channel',
    });
    await operations.recordCompletion(state.claim.job.operationId!, {
      status: 'done',
      totalTokens: 123,
    });
    // A delayed start cannot reset a completed canonical operation.
    await operations.recordStart({
      operationId: state.claim.job.operationId!,
      topicId: state.claim.topic.id,
    });
    expect(
      (
        await db
          .select()
          .from(agentOperations)
          .where(eq(agentOperations.id, state.claim.job.operationId!))
      )[0],
    ).toMatchObject({
      maxSteps: 20,
      modelRuntimeConfig: { test: true },
      status: 'done',
      totalTokens: 123,
    });
  });

  it('does not let ordinary mutations, trash-inclusive deletion or sharing reach Channel rows', async () => {
    const state = await setup();
    const [file] = await db
      .insert(files)
      .values({
        fileType: 'text/plain',
        name: 'file',
        size: 1,
        url: 'files/file',
        userId: fixture.memberId,
        workspaceId: fixture.workspaceId,
      })
      .returning();
    expect(
      await state.legacyMessages.update(state.privateMessage.id, {
        content: 'edited',
        imageList: [{ id: file.id }],
      }),
    ).toEqual({ success: false });
    expect(
      await db
        .select()
        .from(messagesFiles)
        .where(eq(messagesFiles.messageId, state.privateMessage.id)),
    ).toEqual([]);
    await state.legacyMessages.deleteMessage(state.publicMessage.id);
    await state.legacyTopics.batchDeleteIncludingTrashed([state.claim.topic.id]);
    await expect(
      new TopicShareModel(db, fixture.memberId, fixture.workspaceId).create(
        state.claim.topic.id,
        'link',
      ),
    ).rejects.toThrow();
    expect(await state.runtime.findById(state.privateMessage.id)).toBeDefined();
    expect(
      await db.select().from(messages).where(eq(messages.id, state.publicMessage.id)),
    ).toHaveLength(1);
  });

  it('filters inherited Channel scope when a legacy writer omits the message marker', async () => {
    const state = await setup();
    const [unmarked] = await db
      .insert(messages)
      .values({
        content: 'private legacy writer',
        role: 'tool',
        topicId: state.claim.topic.id,
        userId: fixture.memberId,
        workspaceId: fixture.workspaceId,
      })
      .returning();
    expect(await state.legacyMessages.findById(unmarked.id)).toBeUndefined();
    await db.insert(messagePlugins).values({
      id: unmarked.id,
      userId: fixture.memberId,
      workspaceId: fixture.workspaceId,
      identifier: 'private-tool',
      state: { secret: 'private' },
    });
    expect(await state.legacyMessages.findMessagePlugin(unmarked.id)).toBeUndefined();
    await expect(
      state.legacyMessages.updatePluginState(unmarked.id, { secret: 'changed' }),
    ).rejects.toThrow('Plugin not found');
    expect(
      (await db.select().from(messagePlugins).where(eq(messagePlugins.id, unmarked.id)))[0].state,
    ).toEqual({ secret: 'private' });
  });

  it('excludes Channel data from product search and search-index projection', async () => {
    const state = await setup();
    const scope = { userId: fixture.memberId, workspaceId: fixture.workspaceId };
    const search = new FtsSearchRepo(db, scope.userId, scope.workspaceId, undefined, {
      backend: new PgLikeFtsSearchBackend(db, scope),
    });
    const results = await search.search({ query: 'boundarytoken', type: 'topic' });
    expect(results.map((row) => row.id)).toEqual([state.legacyTopic.id]);
    const builder = new FtsSearchDocumentBuilder(db);
    const channelTopics = await db
      .select({ id: topics.id })
      .from(topics)
      .where(eq(topics.channelId, state.channel.id));
    expect(
      await builder.buildByIds(
        'topics',
        channelTopics.map((row) => row.id),
      ),
    ).toEqual([]);
    expect(
      await builder.buildByIds('messages', [state.publicMessage.id, state.privateMessage.id]),
    ).toEqual([]);
    expect(await builder.buildByIds('topics', [state.legacyTopic.id])).toHaveLength(1);
  });

  it('excludes personal Channel data from personal search that filters above the scored scan', async () => {
    // pg_search moves personal-mode scope above its scored scan; LIKE matching in that same
    // shape runs the path without ParadeDB.
    class LiftedScanBackend extends PostgresFtsSearchBackend {
      readonly key = 'lifted-scan';

      constructor(scope: FtsSearchBackendScope) {
        super(db, scope, { ...pgLikeDialect, isolatesScoredScan: true, key: 'lifted-scan' });
      }
    }
    const owner = new ChannelRepository(db, fixture.ownerId);
    const { channel } = await owner.create({ title: 'Personal' });
    const agent = await fixture.addAgent(channel.id, 'Agent');
    const request = await owner.send(channel.id, {
      content: 'boundarytoken personal request',
      mentions: [agent.id],
      requestKey: 'personal',
      routing: 'fallback',
    });
    const [job] = await jobsOf(db, request.id);
    const claim = (await new ChannelExecutionRepository(db).claim(channel.id, job.id, lease))!;
    await db
      .update(topics)
      .set({ title: 'boundarytoken personal run' })
      .where(eq(topics.id, claim.topic.id));
    // A topic-less row from a runtime writer is excluded by its own marker, not its parent.
    await db.insert(messages).values({
      channelId: channel.id,
      content: 'boundarytoken personal orphan',
      role: 'assistant',
      userId: fixture.ownerId,
    });
    const ordinaryTopic = await new TopicModel(db, fixture.ownerId).create({
      title: 'boundarytoken personal ordinary',
    });
    const ordinaryMessage = await new MessageModel(db, fixture.ownerId).create({
      content: 'boundarytoken personal ordinary message',
      role: 'user',
      topicId: ordinaryTopic.id,
    });

    const scope = { userId: fixture.ownerId };
    const search = new FtsSearchRepo(db, scope.userId, undefined, undefined, {
      backend: new LiftedScanBackend(scope),
    });
    const found = async (type: 'message' | 'topic') =>
      (await search.search({ query: 'boundarytoken', type })).map((row) => row.id);
    expect(await found('topic')).toEqual([ordinaryTopic.id]);
    expect(await found('message')).toEqual([ordinaryMessage.id]);
  });
});
