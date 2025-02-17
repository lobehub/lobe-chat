import type { DeepPartial } from 'utility-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';
import { LobeAgentChatConfig, LobeAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';
import { LobeAgentSession, LobeSessionType } from '@/types/session';

import { ServerService } from './server';

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    session: {
      createSession: { mutate: vi.fn() },
      batchCreateSessions: { mutate: vi.fn() },
      cloneSession: { mutate: vi.fn() },
      getGroupedSessions: { query: vi.fn() },
      countSessions: { query: vi.fn() },
      rankSessions: { query: vi.fn() },
      updateSession: { mutate: vi.fn() },
      getSessions: { query: vi.fn() },
      searchSessions: { query: vi.fn() },
      removeSession: { mutate: vi.fn() },
      removeAllSessions: { mutate: vi.fn() },
      updateSessionConfig: { mutate: vi.fn() },
      updateSessionChatConfig: { mutate: vi.fn() },
    },
    agent: {
      getAgentConfig: { query: vi.fn() },
    },
    sessionGroup: {
      createSessionGroup: { mutate: vi.fn() },
      getSessionGroup: { query: vi.fn() },
      removeSessionGroup: { mutate: vi.fn() },
      removeAllSessionGroups: { mutate: vi.fn() },
      updateSessionGroup: { mutate: vi.fn() },
      updateSessionGroupOrder: { mutate: vi.fn() },
    },
  },
}));

describe('ServerService', () => {
  let service: ServerService;

  beforeEach(() => {
    service = new ServerService();
    vi.clearAllMocks();
  });

  it('should check if has sessions', async () => {
    vi.mocked(lambdaClient.session.countSessions.query).mockResolvedValue(0);
    const result = await service.hasSessions();
    expect(result).toBe(true);
  });

  it('should create session', async () => {
    const sessionData = {
      config: {
        model: 'gpt-3.5-turbo',
        systemRole: 'assistant',
        chatConfig: {
          autoCreateTopicThreshold: 2,
          enableHistoryCount: true,
          historyCount: 8,
          topK: 100,
          topP: 1,
        } as any,
        params: {},
        tts: {
          voice: { openai: 'default' },
          sttLocale: 'en-US',
          ttsService: 'openai' as const,
        },
      },
      group: 'group1',
      meta: {
        title: 'Test Session',
        description: 'Test Description',
      } as MetaData,
    } as Partial<LobeAgentSession>;

    await service.createSession('chat' as LobeSessionType, sessionData);

    expect(lambdaClient.session.createSession.mutate).toHaveBeenCalledWith({
      config: { ...sessionData.config, ...sessionData.meta },
      session: { groupId: 'group1' },
      type: 'chat',
    });
  });

  it('should batch create sessions', async () => {
    const sessions = [
      {
        id: '1',
        config: {
          model: 'gpt-3.5-turbo',
          systemRole: 'assistant',
          chatConfig: {
            autoCreateTopicThreshold: 2,
            enableHistoryCount: true,
            historyCount: 8,
            topK: 100,
            topP: 1,
          } as any,
          params: {},
          tts: {
            voice: { openai: 'default' },
            sttLocale: 'en-US',
            ttsService: 'openai' as const,
          },
        },
        createdAt: new Date(),
        meta: {},
        type: LobeSessionType.Agent,
        updatedAt: new Date(),
      } as LobeAgentSession,
    ];
    await service.batchCreateSessions(sessions);
    expect(lambdaClient.session.batchCreateSessions.mutate).toHaveBeenCalledWith(sessions);
  });

  it('should clone session', async () => {
    await service.cloneSession('123', 'New Title');
    expect(lambdaClient.session.cloneSession.mutate).toHaveBeenCalledWith({
      id: '123',
      newTitle: 'New Title',
    });
  });

  it('should get grouped sessions', async () => {
    await service.getGroupedSessions();
    expect(lambdaClient.session.getGroupedSessions.query).toHaveBeenCalled();
  });

  it('should count sessions', async () => {
    await service.countSessions({ startDate: '2023-01-01' });
    expect(lambdaClient.session.countSessions.query).toHaveBeenCalledWith({
      startDate: '2023-01-01',
    });
  });

  it('should rank sessions', async () => {
    await service.rankSessions(10);
    expect(lambdaClient.session.rankSessions.query).toHaveBeenCalledWith(10);
  });

  it('should update session', async () => {
    const updateData = {
      group: 'group1',
      pinned: true,
      meta: { title: 'New Title', description: 'New Description' } as MetaData,
      updatedAt: new Date('2023-01-01'),
    };

    await service.updateSession('123', updateData);

    expect(lambdaClient.session.updateSession.mutate).toHaveBeenCalledWith({
      id: '123',
      value: {
        groupId: 'group1',
        pinned: true,
        title: 'New Title',
        description: 'New Description',
        updatedAt: updateData.updatedAt,
      },
    });
  });

  it('should get session config', async () => {
    await service.getSessionConfig('123');
    expect(lambdaClient.agent.getAgentConfig.query).toHaveBeenCalledWith({
      sessionId: '123',
    });
  });

  it('should update session config', async () => {
    const config: DeepPartial<LobeAgentConfig> = {
      systemRole: 'test',
      model: 'gpt-4',
    };
    const signal = new AbortController().signal;
    await service.updateSessionConfig('123', config, signal);
    expect(lambdaClient.session.updateSessionConfig.mutate).toHaveBeenCalledWith(
      { id: '123', value: config },
      { signal },
    );
  });

  it('should update session chat config', async () => {
    const config: DeepPartial<LobeAgentChatConfig> = {
      autoCreateTopicThreshold: 2,
    };
    const signal = new AbortController().signal;
    await service.updateSessionChatConfig('123', config, signal);
    expect(lambdaClient.session.updateSessionChatConfig.mutate).toHaveBeenCalledWith(
      { id: '123', value: config },
      { signal },
    );
  });

  it('should search sessions', async () => {
    await service.searchSessions('test');
    expect(lambdaClient.session.searchSessions.query).toHaveBeenCalledWith({
      keywords: 'test',
    });
  });

  it('should remove session', async () => {
    await service.removeSession('123');
    expect(lambdaClient.session.removeSession.mutate).toHaveBeenCalledWith({ id: '123' });
  });

  it('should remove all sessions', async () => {
    await service.removeAllSessions();
    expect(lambdaClient.session.removeAllSessions.mutate).toHaveBeenCalled();
  });

  it('should create session group', async () => {
    await service.createSessionGroup('Test Group', 1);
    expect(lambdaClient.sessionGroup.createSessionGroup.mutate).toHaveBeenCalledWith({
      name: 'Test Group',
      sort: 1,
    });
  });

  it('should get session groups', async () => {
    await service.getSessionGroups();
    expect(lambdaClient.sessionGroup.getSessionGroup.query).toHaveBeenCalled();
  });

  it('should remove session group', async () => {
    await service.removeSessionGroup('123', true);
    expect(lambdaClient.sessionGroup.removeSessionGroup.mutate).toHaveBeenCalledWith({
      id: '123',
      removeChildren: true,
    });
  });

  it('should remove all session groups', async () => {
    await service.removeSessionGroups();
    expect(lambdaClient.sessionGroup.removeAllSessionGroups.mutate).toHaveBeenCalled();
  });

  it('should update session group', async () => {
    const updateData = { name: 'New Name' };
    await service.updateSessionGroup('123', updateData);
    expect(lambdaClient.sessionGroup.updateSessionGroup.mutate).toHaveBeenCalledWith({
      id: '123',
      value: updateData,
    });
  });

  it('should update session group order', async () => {
    const sortMap = [{ id: '123', sort: 1 }];
    await service.updateSessionGroupOrder(sortMap);
    expect(lambdaClient.sessionGroup.updateSessionGroupOrder.mutate).toHaveBeenCalledWith({
      sortMap,
    });
  });
});
