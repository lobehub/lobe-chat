// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { INBOX_SESSION_ID } from '@/const/session';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { serverDB } from '@/database/server';
import { AgentModel } from '@/database/server/models/agent';
import { FileModel } from '@/database/server/models/file';
import { KnowledgeBaseModel } from '@/database/server/models/knowledgeBase';
import { SessionModel } from '@/database/server/models/session';
import { UserModel } from '@/database/server/models/user';
import { AgentService } from '@/server/services/agent';
import { KnowledgeType } from '@/types/knowledgeBase';

import { agentRouter } from './agent';

vi.mock('@/database/server/models/agent', () => ({
  AgentModel: vi.fn(),
}));

vi.mock('@/database/server/models/file', () => ({
  FileModel: vi.fn(),
}));

vi.mock('@/database/server/models/knowledgeBase', () => ({
  KnowledgeBaseModel: vi.fn(),
}));

vi.mock('@/database/server/models/session', () => ({
  SessionModel: vi.fn(),
}));

vi.mock('@/database/server/models/user', () => ({
  UserModel: {
    findById: vi.fn(),
  },
}));

vi.mock('@/server/services/agent', () => ({
  AgentService: vi.fn(),
}));

describe('agentRouter', () => {
  const userId = 'test-user';
  const agentId = 'test-agent';
  const sessionId = 'test-session';
  const fileId = 'test-file';
  const knowledgeBaseId = 'test-kb';

  let agentModel: any;
  let fileModel: any;
  let knowledgeBaseModel: any;
  let sessionModel: any;
  let agentService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    agentModel = {
      createAgentFiles: vi.fn().mockResolvedValue({}),
      createAgentKnowledgeBase: vi.fn().mockResolvedValue({}),
      deleteAgentFile: vi.fn().mockResolvedValue({}),
      deleteAgentKnowledgeBase: vi.fn().mockResolvedValue({}),
      findBySessionId: vi.fn().mockResolvedValue(DEFAULT_AGENT_CONFIG),
      getAgentAssignedKnowledge: vi.fn().mockResolvedValue({
        files: [{ id: 'test-file', enabled: true }],
        knowledgeBases: [{ id: 'test-kb', enabled: true }],
      }),
      toggleFile: vi.fn().mockResolvedValue({}),
      toggleKnowledgeBase: vi.fn().mockResolvedValue({}),
    };

    fileModel = {
      query: vi.fn().mockResolvedValue([
        {
          fileType: 'text',
          id: 'test-file',
          name: 'test.txt',
        },
      ]),
    };

    knowledgeBaseModel = {
      query: vi.fn().mockResolvedValue([
        {
          avatar: 'avatar.png',
          description: 'test kb',
          id: 'test-kb',
          name: 'Test KB',
        },
      ]),
    };

    sessionModel = {
      findByIdOrSlug: vi.fn().mockImplementation(async (id) => {
        if (id === INBOX_SESSION_ID) return undefined;
        return { id };
      }),
    };

    agentService = {
      createInbox: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(AgentModel).mockImplementation(() => agentModel);
    vi.mocked(FileModel).mockImplementation(() => fileModel);
    vi.mocked(KnowledgeBaseModel).mockImplementation(() => knowledgeBaseModel);
    vi.mocked(SessionModel).mockImplementation(() => sessionModel);
    vi.mocked(AgentService).mockImplementation(() => agentService);
    vi.mocked(UserModel.findById).mockResolvedValue({ id: 'test-user' } as any);
  });

  describe('createAgentFiles', () => {
    it('should create agent files', async () => {
      const caller = agentRouter.createCaller({
        nextAuth: { id: userId },
        userId,
      });

      await caller.createAgentFiles({
        agentId,
        enabled: true,
        fileIds: [fileId],
      });

      expect(agentModel.createAgentFiles).toHaveBeenCalledWith(agentId, [fileId], true);
    });
  });

  describe('createAgentKnowledgeBase', () => {
    it('should create agent knowledge base', async () => {
      const caller = agentRouter.createCaller({
        nextAuth: { id: userId },
        userId,
      });

      await caller.createAgentKnowledgeBase({
        agentId,
        enabled: true,
        knowledgeBaseId,
      });

      expect(agentModel.createAgentKnowledgeBase).toHaveBeenCalledWith(
        agentId,
        knowledgeBaseId,
        true,
      );
    });
  });

  describe('getAgentConfig', () => {
    it('should return default config if no user found for inbox session', async () => {
      vi.mocked(UserModel.findById).mockResolvedValueOnce(undefined);

      const caller = agentRouter.createCaller({
        nextAuth: { id: userId },
        userId,
      });

      const result = await caller.getAgentConfig({ sessionId: INBOX_SESSION_ID });

      expect(result).toEqual(DEFAULT_AGENT_CONFIG);
    });

    it('should create inbox session if user exists but no inbox session', async () => {
      sessionModel.findByIdOrSlug = vi.fn().mockImplementation(async (id) => {
        if (id === INBOX_SESSION_ID) {
          return id === sessionId ? { id: sessionId } : undefined;
        }
        return { id };
      });

      const caller = agentRouter.createCaller({
        nextAuth: { id: userId },
        userId,
      });

      await caller.getAgentConfig({ sessionId });

      expect(agentModel.findBySessionId).toHaveBeenCalledWith(sessionId);
    });

    it('should get agent config for existing session', async () => {
      const caller = agentRouter.createCaller({
        nextAuth: { id: userId },
        userId,
      });

      await caller.getAgentConfig({ sessionId });

      expect(agentModel.findBySessionId).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('getKnowledgeBasesAndFiles', () => {
    it('should return combined knowledge bases and files', async () => {
      const caller = agentRouter.createCaller({
        nextAuth: { id: userId },
        userId,
      });

      const result = await caller.getKnowledgeBasesAndFiles({ agentId });

      expect(result).toEqual([
        {
          enabled: true,
          fileType: 'text',
          id: fileId,
          name: 'test.txt',
          type: KnowledgeType.File,
        },
        {
          avatar: 'avatar.png',
          description: 'test kb',
          enabled: true,
          id: knowledgeBaseId,
          name: 'Test KB',
          type: KnowledgeType.KnowledgeBase,
        },
      ]);
    });
  });

  describe('deleteAgentFile', () => {
    it('should delete agent file', async () => {
      const caller = agentRouter.createCaller({
        nextAuth: { id: userId },
        userId,
      });

      await caller.deleteAgentFile({
        agentId,
        fileId,
      });

      expect(agentModel.deleteAgentFile).toHaveBeenCalledWith(agentId, fileId);
    });
  });

  describe('deleteAgentKnowledgeBase', () => {
    it('should delete agent knowledge base', async () => {
      const caller = agentRouter.createCaller({
        nextAuth: { id: userId },
        userId,
      });

      await caller.deleteAgentKnowledgeBase({
        agentId,
        knowledgeBaseId,
      });

      expect(agentModel.deleteAgentKnowledgeBase).toHaveBeenCalledWith(agentId, knowledgeBaseId);
    });
  });

  describe('toggleFile', () => {
    it('should toggle file', async () => {
      const caller = agentRouter.createCaller({
        nextAuth: { id: userId },
        userId,
      });

      await caller.toggleFile({
        agentId,
        enabled: true,
        fileId,
      });

      expect(agentModel.toggleFile).toHaveBeenCalledWith(agentId, fileId, true);
    });
  });

  describe('toggleKnowledgeBase', () => {
    it('should toggle knowledge base', async () => {
      const caller = agentRouter.createCaller({
        nextAuth: { id: userId },
        userId,
      });

      await caller.toggleKnowledgeBase({
        agentId,
        enabled: true,
        knowledgeBaseId,
      });

      expect(agentModel.toggleKnowledgeBase).toHaveBeenCalledWith(agentId, knowledgeBaseId, true);
    });
  });
});
