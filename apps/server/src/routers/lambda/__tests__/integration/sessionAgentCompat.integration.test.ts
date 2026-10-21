// @vitest-environment node
import type { LobeChatDatabase } from '@lobechat/database';
import { getTestDB } from '@lobechat/database/test-utils';
import { and, eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ResourcePermissionModel } from '@/database/models/resourcePermission';
import { HomeRepository } from '@/database/repositories/home';
import {
  agents,
  agentsToSessions,
  messages,
  sessionGroups,
  sessions,
  topics,
  workspaceMembers,
  workspaces,
} from '@/database/schemas';
import { resolveAgentReference } from '@/server/services/agent/resolveReference';

import { batchResolveAgentIdFromSessions, resolveContext } from '../../_helpers/resolveContext';
import { agentRouter } from '../../agent';
import { aiChatRouter } from '../../aiChat';
import { messageRouter } from '../../message';
import { sessionRouter } from '../../session';
import { topicRouter } from '../../topic';
import { cleanupTestUser, createTestContext, createTestUser } from './setup';

vi.hoisted(() => vi.stubEnv('FTS_SEARCH_PROVIDER', 'pg_like'));
afterAll(() => vi.unstubAllEnvs());

let db: LobeChatDatabase;
vi.mock('@/database/core/db-adaptor', () => ({ getServerDB: vi.fn(() => db) }));
vi.mock('@/server/utils/scheduleAfterResponse', () => ({ after: vi.fn() }));
vi.mock('@/server/services/file', () => ({
  FileService: vi.fn(function () {
    return { getFileAccessUrl: vi.fn(async () => 'mock-url') };
  }),
}));

describe('native Session to Agent compatibility', () => {
  let userId: string;
  let otherUserId: string;
  const callers = (workspaceId?: string, viewer = userId) => {
    const ctx = { ...createTestContext(viewer), serverDB: db, workspaceId };
    return {
      agent: agentRouter.createCaller(ctx),
      aiChat: aiChatRouter.createCaller(ctx),
      message: messageRouter.createCaller(ctx),
      session: sessionRouter.createCaller(ctx),
      topic: topicRouter.createCaller(ctx),
    };
  };
  const legacy = async (workspaceId?: string) => {
    const [agent] = await db
      .insert(agents)
      .values({ userId, workspaceId, title: 'Legacy' })
      .returning();
    const [session] = await db
      .insert(sessions)
      .values({ userId, workspaceId, type: 'agent' })
      .returning();
    await db
      .insert(agentsToSessions)
      .values({ agentId: agent.id, sessionId: session.id, userId, workspaceId });
    return { agent, session };
  };
  const workspace = async () => {
    const [row] = await db
      .insert(workspaces)
      .values({ name: 'Compat', slug: userId, primaryOwnerId: userId })
      .returning();
    await db.insert(workspaceMembers).values([
      { workspaceId: row.id, userId, role: 'owner' },
      { workspaceId: row.id, userId: otherUserId, role: 'member' },
    ]);
    return row.id;
  };

  beforeEach(async () => {
    db = await getTestDB();
    userId = await createTestUser(db);
    otherUserId = await createTestUser(db);
  });
  afterEach(async () => {
    await cleanupTestUser(db, otherUserId);
    await cleanupTestUser(db, userId);
  });

  it('creates a blank Agent with the native envelope and no Session or mapping rows', async () => {
    const caller = callers();
    const id = await caller.session.createSession({ type: 'agent', config: {}, session: {} });
    expect(id).toMatch(/^agt_/);
    expect(await db.query.agents.findFirst({ where: eq(agents.id, id) })).toMatchObject({
      id,
      userId,
    });
    expect(await db.query.sessions.findMany({ where: eq(sessions.userId, userId) })).toEqual([]);
    expect(
      await db.query.agentsToSessions.findMany({ where: eq(agentsToSessions.userId, userId) }),
    ).toEqual([]);
    expect(await caller.agent.getAgentConfigById({ agentId: id })).toMatchObject({ id });
  });

  it('imports market configuration and metadata while ignoring full-default and server-owned fields', async () => {
    const payload = {
      type: 'agent' as const,
      config: {
        model: 'model-market',
        provider: 'openai',
        params: { temperature: 0.4 },
        systemRole: 'Market role',
        plugins: ['search'],
        chatConfig: { historyCount: 7 },
        openingMessage: 'Welcome',
        openingQuestions: ['Hi'],
        tts: { voice: { openai: 'alloy' } },
        title: 'Market',
        avatar: 'avatar',
        description: 'Description',
        backgroundColor: '#123456',
        tags: ['tag'],
        identifier: 'market-identifier',
        examples: [{ role: 'user', content: 'example' }],
        metadata: { source: 'discover' },
        id: 'agt_injected',
        userId: otherUserId,
        workspaceId: 'foreign',
        createdAt: new Date(0),
        updatedAt: new Date(0),
        slug: 'inbox',
        isDeleted: true,
      },
      session: {
        id: 'ssn_injected',
        userId: otherUserId,
        type: 'agent',
        pinned: true,
        groupId: 'default',
        createdAt: 0,
        updatedAt: 0,
      },
    };
    const id = await callers().session.createSession(payload);
    const row = await db.query.agents.findFirst({ where: eq(agents.id, id) });
    expect(row).toMatchObject({
      userId,
      workspaceId: null,
      pinned: true,
      sessionGroupId: null,
      model: 'model-market',
      provider: 'openai',
      params: { temperature: 0.4 },
      systemRole: 'Market role',
      plugins: ['search'],
      chatConfig: { historyCount: 7 },
      openingMessage: 'Welcome',
      openingQuestions: ['Hi'],
      tts: payload.config.tts,
      title: 'Market',
      avatar: 'avatar',
      description: 'Description',
      backgroundColor: '#123456',
      tags: ['tag'],
      marketIdentifier: 'market-identifier',
      fewShots: payload.config.examples,
      metadata: { source: 'discover' },
      isDeleted: null,
    });
    expect(row?.id).not.toBe('agt_injected');
    expect(row?.slug).not.toBe('inbox');
    expect(row!.createdAt.getTime()).toBeGreaterThan(0);
    expect(await db.query.sessions.findMany({ where: eq(sessions.userId, userId) })).toEqual([]);
  });

  it('uses the same folder visibility and resource permissions as agent.createAgent', async () => {
    const workspaceId = await workspace();
    const [folder] = await db
      .insert(sessionGroups)
      .values({ name: 'Private', userId, workspaceId, visibility: 'private' })
      .returning();
    const caller = callers(workspaceId);
    const id = await caller.session.createSession({
      type: 'agent',
      config: {},
      session: { groupId: folder.id },
    });
    expect(await db.query.agents.findFirst({ where: eq(agents.id, id) })).toMatchObject({
      sessionGroupId: folder.id,
      visibility: 'private',
      workspaceId,
    });
    await expect(
      caller.session.createSession({
        type: 'agent',
        config: { visibility: 'public' },
        session: { groupId: folder.id },
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    const publicId = await caller.session.createSession({ type: 'agent', config: {}, session: {} });
    expect(
      await new ResourcePermissionModel(db, workspaceId).getEffectiveAccessLevel('agent', publicId),
    ).toBe('edit');
    await expect(
      callers(workspaceId, otherUserId).session.createSession({
        type: 'agent',
        config: {},
        session: { groupId: folder.id },
      }),
    ).rejects.toThrow();
  });

  it.each(['legacy', 'new'] as const)(
    'keeps the %s context usable for config, topics, messages, updates and touch',
    async (kind) => {
      const caller = callers();
      const previous = kind === 'legacy' ? await legacy() : undefined;
      const id =
        previous?.session.id ??
        (await caller.session.createSession({ type: 'agent', config: {}, session: {} }));
      const agentId = previous?.agent.id ?? id;
      expect(await caller.agent.getAgentConfigById({ agentId: id })).toMatchObject({ id: agentId });
      expect(await caller.agent.getAgentConfig({ sessionId: id })).toMatchObject({ id: agentId });
      await caller.agent.updateAgentConfig({ agentId: id, value: { title: 'Updated config' } });
      expect(await db.query.agents.findFirst({ where: eq(agents.id, agentId) })).toMatchObject({
        title: 'Updated config',
      });
      const topicId = await caller.topic.createTopic({ sessionId: id, title: 'Native topic' });
      const result = await caller.message.createMessage({
        sessionId: id,
        topicId,
        role: 'user',
        content: 'Native message',
      });
      expect(result).toHaveProperty('id');
      expect(await db.query.topics.findFirst({ where: eq(topics.id, topicId) })).toMatchObject({
        agentId,
        sessionId: previous?.session.id ?? null,
      });
      expect((await caller.topic.getTopics({ agentId: id })).items.map((row) => row.id)).toContain(
        topicId,
      );
      expect(
        (await caller.topic.getTopics({ sessionId: id })).items.map((row) => row.id),
      ).toContain(topicId);
      for (const context of [{ agentId: id }, { sessionId: id }]) {
        expect(
          (await caller.message.getMessages({ ...context, topicId })).map((row) => row.content),
        ).toContain('Native message');
      }
      expect(
        (await caller.message.getMessagesByCursor({ agentId: id, topicId })).messages.map(
          (row) => row.content,
        ),
      ).toContain('Native message');
      const send = await caller.aiChat.sendMessageInServer({
        sessionId: id,
        newUserMessage: { content: 'Native send' },
        newAssistantMessage: { agentId: id, model: 'model-market', provider: 'openai' },
        newTopic: { title: 'Send topic', topicMessageIds: [] },
      });
      expect(send).toHaveProperty('topicId');
      const sent = await db.query.messages.findMany({ where: eq(messages.topicId, send.topicId!) });
      expect(sent).toHaveLength(2);
      expect(sent.every((row) => row.agentId === agentId)).toBe(true);
      await db
        .update(agents)
        .set({ updatedAt: new Date(0) })
        .where(eq(agents.id, agentId));
      const before = Date.now();
      await caller.session.updateSession({
        id,
        value: { updatedAt: new Date(0), groupId: undefined, pinned: undefined },
      });
      const touched = await db.query.agents.findFirst({ where: eq(agents.id, agentId) });
      expect(touched!.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
      if (previous)
        expect(
          (await db.query.sessions.findFirst({ where: eq(sessions.id, previous.session.id) }))!
            .updatedAt,
        ).toEqual(previous.session.updatedAt);
      const sidebar = await new HomeRepository(db, userId).getSidebarAgentList();
      expect(sidebar.ungrouped[0].id).toBe(agentId);
      if (!previous)
        expect(
          await db.query.agentsToSessions.findMany({ where: eq(agentsToSessions.userId, userId) }),
        ).toEqual([]);
    },
  );

  it('reads unmigrated legacy history immediately and isolates new Agent bulk clears from Inbox', async () => {
    const { agent, session } = await legacy();
    const [oldTopic] = await db
      .insert(topics)
      .values({ userId, sessionId: session.id, title: 'Old' })
      .returning();
    await db.insert(messages).values({
      userId,
      sessionId: session.id,
      topicId: oldTopic.id,
      role: 'user',
      content: 'Old history',
    });
    const caller = callers();
    expect(
      (await caller.topic.getTopics({ agentId: session.id })).items.map((row) => row.id),
    ).toContain(oldTopic.id);
    expect(
      (await caller.message.getMessages({ agentId: session.id, topicId: oldTopic.id })).map(
        (row) => row.content,
      ),
    ).toContain('Old history');
    expect(
      (await caller.topic.searchTopics({ keywords: 'Old', sessionId: session.id })).map(
        (row) => row.id,
      ),
    ).toContain(oldTopic.id);
    const id = await caller.session.createSession({ type: 'agent', config: {}, session: {} });
    await caller.message.createMessage({ sessionId: id, role: 'user', content: 'New context' });
    await db.insert(messages).values({ userId, role: 'user', content: 'Inbox orphan' });
    await caller.message.removeMessagesByAssistant({ sessionId: id });
    expect(
      (await db.query.messages.findMany({ where: eq(messages.userId, userId) })).map(
        (row) => row.content,
      ),
    ).toEqual(expect.arrayContaining(['Inbox orphan', 'Old history']));
    expect(await db.query.messages.findMany({ where: eq(messages.agentId, id) })).toEqual([]);
    const newTopic = await caller.topic.createTopic({ sessionId: id, title: 'Clear me' });
    await caller.topic.batchDeleteBySessionId({ id });
    expect(await db.query.topics.findFirst({ where: eq(topics.id, newTopic) })).toMatchObject({
      isDeleted: true,
    });
    expect(await db.query.topics.findFirst({ where: eq(topics.id, oldTopic.id) })).toMatchObject({
      isDeleted: null,
    });
    expect(await resolveContext({ agentId: session.id }, db, userId)).toMatchObject({
      agentId: agent.id,
      sessionId: session.id,
    });
  });

  it('fails closed for foreign, trashed, group and multi-agent contexts', async () => {
    const { agent, session } = await legacy();
    const caller = callers();
    await expect(
      callers(undefined, otherUserId).agent.getAgentConfigById({ agentId: session.id }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    const workspaceId = await workspace();
    await expect(
      callers(workspaceId).agent.getAgentConfigById({ agentId: agent.id }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    const [otherAgent] = await db.insert(agents).values({ userId }).returning();
    expect(
      await resolveContext({ agentId: otherAgent.id, sessionId: session.id }, db, userId),
    ).toMatchObject({ agentId: otherAgent.id, sessionId: null });
    await db
      .insert(agentsToSessions)
      .values({ agentId: otherAgent.id, sessionId: session.id, userId });
    await expect(caller.agent.getAgentConfigById({ agentId: session.id })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
    await expect(caller.session.updateSession({ id: session.id, value: {} })).rejects.toMatchObject(
      { code: 'BAD_REQUEST' },
    );
    await db.update(sessions).set({ type: 'group' }).where(eq(sessions.id, session.id));
    await db.delete(agentsToSessions).where(eq(agentsToSessions.agentId, otherAgent.id));
    await expect(resolveAgentReference(session.id, db, userId)).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
    expect(await batchResolveAgentIdFromSessions([session.id, 'ssn_missing'], db, userId)).toEqual(
      new Map(),
    );
    await db.update(sessions).set({ type: 'agent' }).where(eq(sessions.id, session.id));
    await db.update(agents).set({ isDeleted: true }).where(eq(agents.id, agent.id));
    for (const id of [session.id, agent.id]) {
      await expect(caller.agent.getAgentConfigById({ agentId: id })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
      await expect(caller.session.updateSession({ id, value: {} })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    }
  });

  it('keeps persisted nonstandard Agent ids usable without treating unknown ids as authorized', async () => {
    const [agent] = await db
      .insert(agents)
      .values({ id: `agent_imported_${userId}`, userId, title: 'Imported' })
      .returning();
    expect(await callers().agent.getAgentConfigById({ agentId: agent.id })).toMatchObject({
      id: agent.id,
    });
    await callers().agent.updateAgentConfig({ agentId: agent.id, value: { title: 'Renamed' } });
    expect(await db.query.agents.findFirst({ where: eq(agents.id, agent.id) })).toMatchObject({
      title: 'Renamed',
    });
    await expect(
      callers(undefined, otherUserId).agent.getAgentConfigById({ agentId: agent.id }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(resolveAgentReference('agent_missing', db, userId)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await db.update(agents).set({ isDeleted: true }).where(eq(agents.id, agent.id));
    await expect(callers().agent.getAgentConfigById({ agentId: agent.id })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('trashes unmigrated Session topics together with Agent topics without adopting another Agent', async () => {
    const { agent, session } = await legacy();
    const [other] = await db.insert(agents).values({ userId }).returning();
    const rows = await db
      .insert(topics)
      .values([
        { userId, sessionId: session.id, title: 'Unmigrated' },
        { userId, agentId: agent.id, title: 'Canonical' },
        { userId, agentId: other.id, sessionId: session.id, title: 'Another Agent' },
        { userId, title: 'Inbox' },
      ])
      .returning();
    await callers().topic.batchDeleteBySessionId({ id: session.id });
    const actual = await db.query.topics.findMany({ where: eq(topics.userId, userId) });
    expect(
      actual
        .filter((row) => row.isDeleted)
        .map((row) => row.id)
        .sort(),
    ).toEqual(
      rows
        .slice(0, 2)
        .map((row) => row.id)
        .sort(),
    );
  });

  it('includes orphan Inbox history for aliases and canonical ids without reading standalone Agent history', async () => {
    const [inbox] = await db.insert(agents).values({ userId, slug: 'inbox' }).returning();
    const [other] = await db.insert(agents).values({ userId }).returning();
    await db.insert(messages).values([
      { userId, role: 'user', content: 'Orphan Inbox' },
      { userId, agentId: inbox.id, role: 'user', content: 'Current Inbox' },
      { userId, agentId: other.id, role: 'user', content: 'Standalone' },
      { userId: otherUserId, role: 'user', content: 'Foreign Inbox' },
    ]);
    for (const id of ['inbox', 'ssn_inbox', inbox.id]) {
      expect(
        (await callers().message.getMessages({ sessionId: id })).map((row) => row.content).sort(),
      ).toEqual(['Current Inbox', 'Orphan Inbox']);
    }
    expect(
      (await callers().message.getMessages({ agentId: other.id })).map((row) => row.content),
    ).toEqual(['Standalone']);
  });

  it('passes the canonical id to config redaction and denies use-only operations at view access', async () => {
    const workspaceId = await workspace();
    const { agent, session } = await legacy(workspaceId);
    await db
      .update(agents)
      .set({ systemRole: 'Owner secret', title: 'Profile' })
      .where(eq(agents.id, agent.id));
    await new ResourcePermissionModel(db, workspaceId).setAccessLevel(
      'agent',
      agent.id,
      'view',
      userId,
    );
    const member = callers(workspaceId, otherUserId);
    const config = await member.agent.getAgentConfigById({ agentId: session.id });
    expect(config).toMatchObject({ id: agent.id, title: 'Profile' });
    expect(config).not.toHaveProperty('systemRole');
    await expect(
      member.agent.updateAgentConfig({ agentId: session.id, value: { title: 'Stolen' } }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(member.session.updateSession({ id: session.id, value: {} })).rejects.toMatchObject(
      { code: 'FORBIDDEN' },
    );
    await expect(
      member.message.createMessage({ sessionId: session.id, role: 'user', content: 'Forbidden' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(
      await db.query.messages.findMany({
        where: and(eq(messages.agentId, agent.id), eq(messages.userId, otherUserId)),
      }),
    ).toEqual([]);
  });

  it('never reprovisions a trashed or private Inbox through the legacy config fallback', async () => {
    const workspaceId = await workspace();
    const { agent, session } = await legacy(workspaceId);
    await db.update(sessions).set({ slug: 'inbox' }).where(eq(sessions.id, session.id));
    await db.update(agents).set({ visibility: 'private' }).where(eq(agents.id, agent.id));
    await expect(
      callers(workspaceId, otherUserId).agent.getAgentConfig({ sessionId: 'inbox' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await db.update(agents).set({ isDeleted: true }).where(eq(agents.id, agent.id));
    await expect(
      callers(workspaceId).agent.getAgentConfig({ sessionId: 'inbox' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(
      await db.query.agents.findMany({ where: eq(agents.workspaceId, workspaceId) }),
    ).toHaveLength(1);
    expect(await db.query.agents.findFirst({ where: eq(agents.id, agent.id) })).toMatchObject({
      isDeleted: true,
    });
  });

  it('resolves explicit Inbox aliases without creating Session rows and rejects metadata writes through touch', async () => {
    const [inbox] = await db.insert(agents).values({ userId, slug: 'inbox' }).returning();
    for (const id of ['inbox', 'ssn_inbox'])
      expect(await resolveAgentReference(id, db, userId)).toEqual({
        agentId: inbox.id,
        sessionId: null,
      });
    expect(await callers().agent.getAgentConfig({ sessionId: 'inbox' })).toMatchObject({
      id: inbox.id,
    });
    await expect(
      callers().session.updateSession({ id: inbox.id, value: { pinned: true } as never }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(await db.query.sessions.findMany({ where: eq(sessions.userId, userId) })).toEqual([]);
  });
});
