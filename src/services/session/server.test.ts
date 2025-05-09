import { beforeEach, describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';
import { LobeSessionType } from '@/types/session';

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
      updateSessionConfig: { mutate: vi.fn() },
      updateSessionChatConfig: { mutate: vi.fn() },
      getSessions: { query: vi.fn() },
      searchSessions: { query: vi.fn() },
      removeSession: { mutate: vi.fn() },
      removeAllSessions: { mutate: vi.fn() },
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
    vi.clearAllMocks();
    service = new ServerService();
  });

  it('hasSessions should return true if count is 0', async () => {
    vi.mocked(lambdaClient.session.countSessions.query).mockResolvedValue(0);
    const result = await service.hasSessions();
    expect(result).toBe(true);
  });

  it('createSession should call lambdaClient with correct params', async () => {
    const mockData = {
      config: {
        model: 'gpt-3.5',
        params: {},
        systemRole: '',
        chatConfig: {
          autoCreateTopicThreshold: 2,
          compressThreshold: 10,
          enableAutoCreateTopic: true,
          enableCompressThreshold: true,
          maxTokens: 2000,
          model: 'gpt-3.5-turbo',
          params: {},
          temperature: 0.7,
          title: 'test',
        },
        tts: {
          showAllLocaleVoice: false,
          sttLocale: 'auto',
          ttsService: 'openai' as const,
          voice: {
            model: 'tts-1',
            name: 'alloy',
            type: 'tts',
            openai: 'voice-id',
          },
        },
        openingQuestions: ['Question 1', 'Question 2'],
        openingMessage: 'Hello, I am [LobeChat](https://github.com/lobehub/lobe-chat).',
      },
      group: 'testGroup',
      meta: { description: 'test' },
      title: 'Test Session',
    };

    await service.createSession(LobeSessionType.Agent, mockData);

    expect(lambdaClient.session.createSession.mutate).toBeCalledWith({
      config: { ...mockData.config, description: 'test' },
      session: { title: 'Test Session', groupId: 'testGroup' },
      type: LobeSessionType.Agent,
    });
  });

  it('batchCreateSessions should call lambdaClient', async () => {
    const mockSessions = [
      {
        id: '1',
        title: 'Test',
        config: {
          model: 'gpt-3.5',
          params: {},
          systemRole: '',
          chatConfig: {
            autoCreateTopicThreshold: 2,
            compressThreshold: 10,
            enableAutoCreateTopic: true,
            enableCompressThreshold: true,
            maxTokens: 2000,
            model: 'gpt-3.5-turbo',
            params: {},
            temperature: 0.7,
            title: 'test',
          },
          tts: {
            showAllLocaleVoice: false,
            sttLocale: 'auto',
            ttsService: 'openai' as const,
            voice: {
              model: 'tts-1',
              name: 'alloy',
              type: 'tts',
              openai: 'voice-id',
            },
          },
        },
        createdAt: new Date(),
        meta: { description: 'test' },
        model: 'gpt-3.5',
        type: LobeSessionType.Agent,
        updatedAt: new Date(),
      },
    ];

    await service.batchCreateSessions(mockSessions as any);
    expect(lambdaClient.session.batchCreateSessions.mutate).toBeCalledWith(mockSessions);
  });

  it('cloneSession should call lambdaClient', async () => {
    await service.cloneSession('123', 'New Title');
    expect(lambdaClient.session.cloneSession.mutate).toBeCalledWith({
      id: '123',
      newTitle: 'New Title',
    });
  });

  it('getGroupedSessions should call lambdaClient', async () => {
    await service.getGroupedSessions();
    expect(lambdaClient.session.getGroupedSessions.query).toBeCalled();
  });

  it('countSessions should call lambdaClient with params', async () => {
    const params = { startDate: '2023-01-01' };
    await service.countSessions(params);
    expect(lambdaClient.session.countSessions.query).toBeCalledWith(params);
  });

  it('rankSessions should call lambdaClient with limit', async () => {
    await service.rankSessions(10);
    expect(lambdaClient.session.rankSessions.query).toBeCalledWith(10);
  });

  it('updateSession should call lambdaClient with correct params', async () => {
    const mockData = {
      group: 'default',
      pinned: true,
      meta: { description: 'bar' },
      updatedAt: new Date(),
    };

    await service.updateSession('123', mockData);

    expect(lambdaClient.session.updateSession.mutate).toBeCalledWith({
      id: '123',
      value: {
        groupId: null,
        pinned: true,
        description: 'bar',
        updatedAt: mockData.updatedAt,
      },
    });
  });

  it('getSessionConfig should call lambdaClient', async () => {
    await service.getSessionConfig('123');
    expect(lambdaClient.agent.getAgentConfig.query).toBeCalledWith({ sessionId: '123' });
  });

  it('updateSessionConfig should call lambdaClient', async () => {
    const config = { model: 'gpt-4' };
    const signal = new AbortController().signal;
    await service.updateSessionConfig('123', config, signal);
    expect(lambdaClient.session.updateSessionConfig.mutate).toBeCalledWith(
      { id: '123', value: config },
      { signal },
    );
  });

  it('getSessionsByType should call lambdaClient', async () => {
    await service.getSessionsByType('all');
    expect(lambdaClient.session.getSessions.query).toBeCalledWith({});
  });

  it('searchSessions should call lambdaClient with keywords', async () => {
    await service.searchSessions('test');
    expect(lambdaClient.session.searchSessions.query).toBeCalledWith({ keywords: 'test' });
  });

  it('removeSession should call lambdaClient', async () => {
    await service.removeSession('123');
    expect(lambdaClient.session.removeSession.mutate).toBeCalledWith({ id: '123' });
  });

  it('removeAllSessions should call lambdaClient', async () => {
    await service.removeAllSessions();
    expect(lambdaClient.session.removeAllSessions.mutate).toBeCalled();
  });

  it('createSessionGroup should call lambdaClient', async () => {
    await service.createSessionGroup('Test Group', 1);
    expect(lambdaClient.sessionGroup.createSessionGroup.mutate).toBeCalledWith({
      name: 'Test Group',
      sort: 1,
    });
  });

  it('getSessionGroups should call lambdaClient', async () => {
    await service.getSessionGroups();
    expect(lambdaClient.sessionGroup.getSessionGroup.query).toBeCalled();
  });

  it('removeSessionGroup should call lambdaClient', async () => {
    await service.removeSessionGroup('123', true);
    expect(lambdaClient.sessionGroup.removeSessionGroup.mutate).toBeCalledWith({
      id: '123',
      removeChildren: true,
    });
  });

  it('updateSessionGroup should call lambdaClient', async () => {
    const value = { name: 'Updated Group' };
    await service.updateSessionGroup('123', value);
    expect(lambdaClient.sessionGroup.updateSessionGroup.mutate).toBeCalledWith({
      id: '123',
      value,
    });
  });

  it('updateSessionGroupOrder should call lambdaClient', async () => {
    const sortMap = [{ id: '123', sort: 1 }];
    await service.updateSessionGroupOrder(sortMap);
    expect(lambdaClient.sessionGroup.updateSessionGroupOrder.mutate).toBeCalledWith({ sortMap });
  });
});
