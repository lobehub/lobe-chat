// @vitest-environment node
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  agents,
  agentsFiles,
  agentsKnowledgeBases,
  agentsToSessions,
  documents,
  files,
  knowledgeBases,
  sessions,
  users,
} from '../../schemas';
import { LobeChatDatabase } from '../../type';
import { AgentModel } from '../agent';
import { getTestDB } from './_util';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'agent-model-test-user-id';
const agentModel = new AgentModel(serverDB, userId);

const knowledgeBase = { id: 'kb1', userId, name: 'knowledgeBase' };
const fileList = [
  {
    id: '1',
    name: 'document.pdf',
    url: 'https://a.com/document.pdf',
    size: 1000,
    fileType: 'application/pdf',
    userId,
  },
  {
    id: '2',
    name: 'image.jpg',
    url: 'https://a.com/image.jpg',
    size: 500,
    fileType: 'image/jpeg',
    userId,
  },
];

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }]);
  await serverDB.insert(knowledgeBases).values(knowledgeBase);
  await serverDB.insert(files).values(fileList);
});

afterEach(async () => {
  await serverDB.delete(users).where(eq(users.id, userId));
});

describe('AgentModel', () => {
  describe('getAgentConfigById', () => {
    it('should return agent config with assigned knowledge', async () => {
      const agentId = 'test-agent-id';
      await serverDB.insert(agents).values({ id: agentId, userId });
      await serverDB
        .insert(agentsKnowledgeBases)
        .values({ agentId, knowledgeBaseId: 'kb1', userId });
      await serverDB.insert(agentsFiles).values({ agentId, fileId: '1', userId });

      const result = await agentModel.getAgentConfigById(agentId);

      expect(result).toBeDefined();
      expect(result.id).toBe(agentId);
      expect(result.knowledgeBases).toHaveLength(1);
      expect(result.files).toHaveLength(1);
    });

    it('should fetch and include document content for enabled files', async () => {
      const agentId = 'test-agent-with-docs';
      await serverDB.insert(agents).values({ id: agentId, userId });
      await serverDB.insert(agentsFiles).values({ agentId, fileId: '1', userId, enabled: true });
      await serverDB.insert(documents).values({
        id: 'doc1',
        fileId: '1',
        userId,
        content: 'This is document content',
        fileType: 'application/pdf',
        totalCharCount: 100,
        totalLineCount: 10,
        sourceType: 'file',
        source: 'document.pdf',
      });

      const result = await agentModel.getAgentConfigById(agentId);

      expect(result).toBeDefined();
      expect(result.files).toHaveLength(1);
      expect(result.files[0].content).toBe('This is document content');
      expect(result.files[0].enabled).toBe(true);
    });

    it('should not include content for disabled files', async () => {
      const agentId = 'test-agent-disabled-file';
      await serverDB.insert(agents).values({ id: agentId, userId });
      await serverDB.insert(agentsFiles).values({ agentId, fileId: '1', userId, enabled: false });
      await serverDB.insert(documents).values({
        id: 'doc2',
        fileId: '1',
        userId,
        content: 'This should not be included',
        fileType: 'application/pdf',
        totalCharCount: 100,
        totalLineCount: 10,
        sourceType: 'file',
        source: 'document.pdf',
      });

      const result = await agentModel.getAgentConfigById(agentId);

      expect(result).toBeDefined();
      expect(result.files).toHaveLength(1);
      expect(result.files[0].content).toBeUndefined();
      expect(result.files[0].enabled).toBe(false);
    });

    it('should handle files without documents', async () => {
      const agentId = 'test-agent-no-docs';
      await serverDB.insert(agents).values({ id: agentId, userId });
      await serverDB.insert(agentsFiles).values({ agentId, fileId: '2', userId, enabled: true });

      const result = await agentModel.getAgentConfigById(agentId);

      expect(result).toBeDefined();
      expect(result.files).toHaveLength(1);
      expect(result.files[0].content).toBeUndefined();
    });

    it('should handle agent with no files', async () => {
      const agentId = 'test-agent-no-files';
      await serverDB.insert(agents).values({ id: agentId, userId });

      const result = await agentModel.getAgentConfigById(agentId);

      expect(result).toBeDefined();
      expect(result.files).toHaveLength(0);
    });
  });

  describe('findBySessionId', () => {
    it('should find agent by session id', async () => {
      const agentId = 'test-agent-id';
      const sessionId = 'test-session-id';
      await serverDB.insert(agents).values({ id: agentId, userId });
      await serverDB.insert(sessions).values({ id: sessionId, userId });
      await serverDB.insert(agentsToSessions).values({ agentId, sessionId, userId });

      const result = await agentModel.findBySessionId(sessionId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(agentId);
    });

    it('should return undefined when session is not found', async () => {
      const result = await agentModel.findBySessionId('non-existent-session');

      expect(result).toBeUndefined();
    });
  });

  describe('createAgentKnowledgeBase', () => {
    it('should create a new agent knowledge base association with enabled=true by default', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId })
        .returning()
        .then((res) => res[0]);

      await agentModel.createAgentKnowledgeBase(agent.id, knowledgeBase.id);

      const result = await serverDB.query.agentsKnowledgeBases.findFirst({
        where: eq(agentsKnowledgeBases.agentId, agent.id),
      });

      expect(result).toMatchObject({
        agentId: agent.id,
        knowledgeBaseId: knowledgeBase.id,
        userId,
        enabled: true,
      });
    });

    it('should create a new agent knowledge base association with enabled=false', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId })
        .returning()
        .then((res) => res[0]);

      await agentModel.createAgentKnowledgeBase(agent.id, knowledgeBase.id, false);

      const result = await serverDB.query.agentsKnowledgeBases.findFirst({
        where: eq(agentsKnowledgeBases.agentId, agent.id),
      });

      expect(result).toMatchObject({
        agentId: agent.id,
        knowledgeBaseId: knowledgeBase.id,
        userId,
        enabled: false,
      });
    });
  });

  describe('deleteAgentKnowledgeBase', () => {
    it('should delete an agent knowledge base association', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId })
        .returning()
        .then((res) => res[0]);
      await serverDB
        .insert(agentsKnowledgeBases)
        .values({ agentId: agent.id, knowledgeBaseId: knowledgeBase.id, userId });

      await agentModel.deleteAgentKnowledgeBase(agent.id, knowledgeBase.id);

      const result = await serverDB.query.agentsKnowledgeBases.findFirst({
        where: eq(agentsKnowledgeBases.agentId, agent.id),
      });

      expect(result).toBeUndefined();
    });
  });

  describe('toggleKnowledgeBase', () => {
    it('should toggle the enabled status of an agent knowledge base association', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId })
        .returning()
        .then((res) => res[0]);

      await serverDB
        .insert(agentsKnowledgeBases)
        .values({ agentId: agent.id, knowledgeBaseId: knowledgeBase.id, userId, enabled: true });

      await agentModel.toggleKnowledgeBase(agent.id, knowledgeBase.id, false);

      const result = await serverDB.query.agentsKnowledgeBases.findFirst({
        where: eq(agentsKnowledgeBases.agentId, agent.id),
      });

      expect(result?.enabled).toBe(false);
    });
  });

  describe('createAgentFiles', () => {
    it('should create new agent file associations with enabled=true by default', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId })
        .returning()
        .then((res) => res[0]);

      await agentModel.createAgentFiles(agent.id, ['1', '2']);

      const results = await serverDB.query.agentsFiles.findMany({
        where: eq(agentsFiles.agentId, agent.id),
      });

      expect(results).toHaveLength(2);
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ agentId: agent.id, fileId: '1', userId, enabled: true }),
          expect.objectContaining({ agentId: agent.id, fileId: '2', userId, enabled: true }),
        ]),
      );
    });

    it('should create new agent file associations with enabled=false', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId })
        .returning()
        .then((res) => res[0]);

      await agentModel.createAgentFiles(agent.id, ['1'], false);

      const results = await serverDB.query.agentsFiles.findMany({
        where: eq(agentsFiles.agentId, agent.id),
      });

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        agentId: agent.id,
        fileId: '1',
        userId,
        enabled: false,
      });
    });

    it('should skip files that already exist', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId })
        .returning()
        .then((res) => res[0]);

      // First insert
      await serverDB.insert(agentsFiles).values({ agentId: agent.id, fileId: '1', userId });

      // Try to insert the same file again
      await agentModel.createAgentFiles(agent.id, ['1', '2']);

      const results = await serverDB.query.agentsFiles.findMany({
        where: eq(agentsFiles.agentId, agent.id),
      });

      // Should only have 2 files (1 existing + 1 new), not 3
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.fileId).sort()).toEqual(['1', '2']);
    });

    it('should return early when all files already exist', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId })
        .returning()
        .then((res) => res[0]);

      // First insert
      await serverDB.insert(agentsFiles).values([
        { agentId: agent.id, fileId: '1', userId },
        { agentId: agent.id, fileId: '2', userId },
      ]);

      // Try to insert the same files again
      const result = await agentModel.createAgentFiles(agent.id, ['1', '2']);

      // Should return undefined (early return)
      expect(result).toBeUndefined();

      const results = await serverDB.query.agentsFiles.findMany({
        where: eq(agentsFiles.agentId, agent.id),
      });

      // Should still only have 2 files
      expect(results).toHaveLength(2);
    });
  });

  describe('deleteAgentFile', () => {
    it('should delete an agent file association', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId })
        .returning()
        .then((res) => res[0]);

      await serverDB.insert(agentsFiles).values({ agentId: agent.id, fileId: '1', userId });

      await agentModel.deleteAgentFile(agent.id, '1');

      const result = await serverDB.query.agentsFiles.findFirst({
        where: eq(agentsFiles.agentId, agent.id),
      });

      expect(result).toBeUndefined();
    });
  });

  describe('toggleFile', () => {
    it('should toggle the enabled status of an agent file association', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId })
        .returning()
        .then((res) => res[0]);

      await serverDB
        .insert(agentsFiles)
        .values({ agentId: agent.id, fileId: '1', userId, enabled: true });

      await agentModel.toggleFile(agent.id, '1', false);

      const result = await serverDB.query.agentsFiles.findFirst({
        where: eq(agentsFiles.agentId, agent.id),
      });

      expect(result?.enabled).toBe(false);
    });
  });

  describe('updateConfig', () => {
    it('should update agent basic fields', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId, title: 'Original Title', description: 'Original Desc' })
        .returning()
        .then((res) => res[0]);

      await agentModel.updateConfig(agent.id, { title: 'New Title', description: 'New Desc' });

      const updated = await serverDB.query.agents.findFirst({
        where: eq(agents.id, agent.id),
      });

      expect(updated?.title).toBe('New Title');
      expect(updated?.description).toBe('New Desc');
    });

    it('should return early when data is null', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId, title: 'Original' })
        .returning()
        .then((res) => res[0]);

      const result = await agentModel.updateConfig(agent.id, null);

      expect(result).toBeUndefined();

      const unchanged = await serverDB.query.agents.findFirst({
        where: eq(agents.id, agent.id),
      });
      expect(unchanged?.title).toBe('Original');
    });

    it('should return early when data is undefined', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId, title: 'Original' })
        .returning()
        .then((res) => res[0]);

      const result = await agentModel.updateConfig(agent.id, undefined);

      expect(result).toBeUndefined();

      const unchanged = await serverDB.query.agents.findFirst({
        where: eq(agents.id, agent.id),
      });
      expect(unchanged?.title).toBe('Original');
    });

    it('should return early when data is empty object', async () => {
      const agent = await serverDB
        .insert(agents)
        .values({ userId, title: 'Original' })
        .returning()
        .then((res) => res[0]);

      const result = await agentModel.updateConfig(agent.id, {});

      expect(result).toBeUndefined();

      const unchanged = await serverDB.query.agents.findFirst({
        where: eq(agents.id, agent.id),
      });
      expect(unchanged?.title).toBe('Original');
    });

    it('should return undefined when agent does not exist', async () => {
      const result = await agentModel.updateConfig('non-existent-id', { title: 'New Title' });

      expect(result).toBeUndefined();
    });

    it('should not update agent of other users', async () => {
      const otherUserId = 'other-user-for-update-test';
      await serverDB.insert(users).values([{ id: otherUserId }]);

      const otherAgent = await serverDB
        .insert(agents)
        .values({ userId: otherUserId, title: 'Other User Agent' })
        .returning()
        .then((res) => res[0]);

      const result = await agentModel.updateConfig(otherAgent.id, { title: 'Hacked Title' });

      expect(result).toBeUndefined();

      const unchanged = await serverDB.query.agents.findFirst({
        where: eq(agents.id, otherAgent.id),
      });
      expect(unchanged?.title).toBe('Other User Agent');
    });

    describe('params field handling', () => {
      it('should update params field values', async () => {
        const agent = await serverDB
          .insert(agents)
          .values({ userId, params: { temperature: 0.5 } })
          .returning()
          .then((res) => res[0]);

        await agentModel.updateConfig(agent.id, { params: { temperature: 0.8 } });

        const updated = await serverDB.query.agents.findFirst({
          where: eq(agents.id, agent.id),
        });

        expect(updated?.params).toEqual({ temperature: 0.8 });
      });

      it('should add new params while keeping existing ones', async () => {
        const agent = await serverDB
          .insert(agents)
          .values({ userId, params: { temperature: 0.5 } })
          .returning()
          .then((res) => res[0]);

        await agentModel.updateConfig(agent.id, { params: { topP: 0.9 } });

        const updated = await serverDB.query.agents.findFirst({
          where: eq(agents.id, agent.id),
        });

        expect(updated?.params).toEqual({ temperature: 0.5, topP: 0.9 });
      });

      it('should use null to disable a param (frontend semantics)', async () => {
        const agent = await serverDB
          .insert(agents)
          .values({ userId, params: { temperature: 0.5, topP: 0.9 } })
          .returning()
          .then((res) => res[0]);

        await agentModel.updateConfig(agent.id, { params: { temperature: null } });

        const updated = await serverDB.query.agents.findFirst({
          where: eq(agents.id, agent.id),
        });

        expect(updated?.params).toEqual({ temperature: null, topP: 0.9 });
      });

      it('should keep existing params when updating with empty params object', async () => {
        const agent = await serverDB
          .insert(agents)
          .values({ userId, params: { temperature: 0.5 } })
          .returning()
          .then((res) => res[0]);

        // Empty params object means no changes to params - existing values are preserved
        await agentModel.updateConfig(agent.id, { params: {} });

        const updated = await serverDB.query.agents.findFirst({
          where: eq(agents.id, agent.id),
        });

        // Existing params should be preserved
        expect(updated?.params).toEqual({ temperature: 0.5 });
      });

      it('should handle agent with no existing params', async () => {
        const agent = await serverDB
          .insert(agents)
          .values({ userId })
          .returning()
          .then((res) => res[0]);

        await agentModel.updateConfig(agent.id, { params: { temperature: 0.7 } });

        const updated = await serverDB.query.agents.findFirst({
          where: eq(agents.id, agent.id),
        });

        expect(updated?.params).toEqual({ temperature: 0.7 });
      });
    });

    describe('deep merge behavior', () => {
      it('should deep merge nested objects', async () => {
        const agent = await serverDB
          .insert(agents)
          .values({
            userId,
            title: 'Test Agent',
            chatConfig: { historyCount: 10, enableAutoCreateTopic: true },
          })
          .returning()
          .then((res) => res[0]);

        await agentModel.updateConfig(agent.id, {
          chatConfig: { historyCount: 20 },
        });

        const updated = await serverDB.query.agents.findFirst({
          where: eq(agents.id, agent.id),
        });

        expect(updated?.chatConfig).toEqual({
          historyCount: 20,
          enableAutoCreateTopic: true,
        });
      });

      it('should preserve unmodified fields when updating specific fields', async () => {
        const agent = await serverDB
          .insert(agents)
          .values({
            userId,
            title: 'Original Title',
            description: 'Original Description',
            systemRole: 'You are a helpful assistant',
          })
          .returning()
          .then((res) => res[0]);

        await agentModel.updateConfig(agent.id, { title: 'Updated Title' });

        const updated = await serverDB.query.agents.findFirst({
          where: eq(agents.id, agent.id),
        });

        expect(updated?.title).toBe('Updated Title');
        expect(updated?.description).toBe('Original Description');
        expect(updated?.systemRole).toBe('You are a helpful assistant');
      });
    });
  });
});
