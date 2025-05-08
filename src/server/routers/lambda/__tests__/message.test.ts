import { describe, expect, it, vi } from 'vitest';

import { MessageModel } from '@/database/models/message';
import { FileService } from '@/server/services/file';

import { messageRouter } from '../message';

vi.mock('@/database/models/message');
vi.mock('@/server/services/file');
vi.mock('@/database/server', () => ({
  getServerDB: vi.fn().mockResolvedValue({}),
}));

describe('messageRouter', () => {
  const mockMessageModel = {
    batchCreate: vi.fn(),
    count: vi.fn(),
    countWords: vi.fn(),
    create: vi.fn(),
    queryAll: vi.fn(),
    queryBySessionId: vi.fn(),
    getHeatmaps: vi.fn(),
    query: vi.fn(),
    rankModels: vi.fn(),
    deleteAllMessages: vi.fn(),
    deleteMessage: vi.fn(),
    deleteMessageQuery: vi.fn(),
    deleteMessages: vi.fn(),
    deleteMessagesBySession: vi.fn(),
    queryByKeyword: vi.fn(),
    update: vi.fn(),
    updateMessagePlugin: vi.fn(),
    updatePluginState: vi.fn(),
    updateTTS: vi.fn(),
    updateTranslate: vi.fn(),
    deleteMessageTTS: vi.fn(),
    deleteMessageTranslate: vi.fn(),
  };

  const mockFileService = {
    getFullFileUrl: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(MessageModel).mockImplementation(() => mockMessageModel as any);
    vi.mocked(FileService).mockImplementation(() => mockFileService as any);
  });

  it('should handle batchCreateMessages', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    mockMessageModel.batchCreate.mockResolvedValue({ rowCount: 2 });

    const result = await caller.batchCreateMessages([{ id: '1' }, { id: '2' }]);

    expect(result).toEqual({
      added: 2,
      ids: [],
      skips: [],
      success: true,
    });
  });

  it('should handle count', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    mockMessageModel.count.mockResolvedValue(5);

    const result = await caller.count({ startDate: '2023-01-01' });

    expect(result).toBe(5);
  });

  it('should handle countWords', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    mockMessageModel.countWords.mockResolvedValue(100);

    const result = await caller.countWords({ startDate: '2023-01-01' });

    expect(result).toBe(100);
  });

  it('should handle createMessage', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    mockMessageModel.create.mockResolvedValue({ id: 'msg-1' });

    const result = await caller.createMessage({ content: 'test' });

    expect(result).toBe('msg-1');
  });

  it('should handle getAllMessages', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    const messages = [{ id: '1' }, { id: '2' }];
    mockMessageModel.queryAll.mockResolvedValue(messages);

    const result = await caller.getAllMessages();

    expect(result).toEqual(messages);
  });

  it('should handle getAllMessagesInSession', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    const messages = [{ id: '1' }, { id: '2' }];
    mockMessageModel.queryBySessionId.mockResolvedValue(messages);

    const result = await caller.getAllMessagesInSession({ sessionId: 'session-1' });

    expect(result).toEqual(messages);
  });

  it('should handle getMessages', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    const messages = [{ id: '1' }, { id: '2' }];
    mockMessageModel.query.mockResolvedValue(messages);
    mockFileService.getFullFileUrl.mockImplementation((url) => Promise.resolve(url));

    const result = await caller.getMessages({ sessionId: 'session-1' });

    expect(result).toEqual(messages);
  });

  it('should handle removeMessage', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    await caller.removeMessage({ id: 'msg-1' });

    expect(mockMessageModel.deleteMessage).toHaveBeenCalledWith('msg-1');
  });

  it('should handle removeMessages', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    await caller.removeMessages({ ids: ['msg-1', 'msg-2'] });

    expect(mockMessageModel.deleteMessages).toHaveBeenCalledWith(['msg-1', 'msg-2']);
  });

  it('should handle searchMessages', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    const messages = [{ id: '1' }, { id: '2' }];
    mockMessageModel.queryByKeyword.mockResolvedValue(messages);

    const result = await caller.searchMessages({ keywords: 'test' });

    expect(result).toEqual(messages);
  });

  it('should handle updateTTS', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    await caller.updateTTS({ id: 'msg-1', value: { voice: 'test-voice' } });

    expect(mockMessageModel.updateTTS).toHaveBeenCalledWith('msg-1', { voice: 'test-voice' });
  });

  it('should handle updateTTS with false value', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    await caller.updateTTS({ id: 'msg-1', value: false });

    expect(mockMessageModel.deleteMessageTTS).toHaveBeenCalledWith('msg-1');
  });

  it('should handle updateTranslate', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    await caller.updateTranslate({ id: 'msg-1', value: { to: 'es', content: 'hola' } });

    expect(mockMessageModel.updateTranslate).toHaveBeenCalledWith('msg-1', {
      to: 'es',
      content: 'hola',
    });
  });

  it('should handle updateTranslate with false value', async () => {
    const caller = messageRouter.createCaller({
      userId: 'test-user',
    } as any);

    await caller.updateTranslate({ id: 'msg-1', value: false });

    expect(mockMessageModel.deleteMessageTranslate).toHaveBeenCalledWith('msg-1');
  });
});
