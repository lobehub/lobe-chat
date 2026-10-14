import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendMessage as createSendMessage } from '../store/slices/message/action/sendMessage';
import { useSendMessage } from './useSendMessage';

const mocks = vi.hoisted(() => ({
  chat: undefined as any,
  files: undefined as any,
  preflight: vi.fn(),
  state: undefined as any,
  store: undefined as any,
  toast: { error: vi.fn() },
}));

vi.mock('@lobehub/ui/base-ui', () => ({ toast: mocks.toast }));
vi.mock('../store', () => ({ useConversationStoreApi: () => mocks.store }));
vi.mock('@/store/chat', () => ({ useChatStore: { getState: () => mocks.chat } }));
vi.mock('@/store/chat/selectors', () => ({
  operationSelectors: { isInputLoadingByContext: () => () => false },
  topicSelectors: { getTopicById: () => () => ({ projectWorkingDirectoryId: 'directory-A' }) },
}));
vi.mock('@/store/file', () => ({
  fileChatSelectors: {
    chatContextSelections: (key: string) => (state: any) => state.selections[key] ?? [],
    chatUploadFileList: (state: any) => state.chatUploadFileList,
    isUploadingFiles: () => false,
  },
  useFileStore: { getState: () => mocks.files },
}));
vi.mock('@/features/Projects/WorkingDirectories/checkExecution', () => ({
  checkProjectExecution: (...args: unknown[]) => mocks.preflight(...args),
}));

const deferred = () => {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, reject, resolve };
};

describe('composer send transaction', () => {
  let markdown: string;
  let document: Record<string, any>;
  let clearContent: ReturnType<typeof vi.fn>;
  let editor: any;
  let params: any;

  beforeEach(() => {
    vi.clearAllMocks();
    markdown = 'Original message';
    document = { root: { text: markdown } };
    clearContent = vi.fn(() => {
      markdown = '';
      document = { root: { text: '' } };
    });
    editor = {
      getDocument: () => document,
      getJSONState: () => document,
      getLexicalEditor: () => ({}),
      setJSONState: vi.fn(),
    };
    params = {
      clearContent,
      editor,
      getEditorData: () => document,
      getMarkdownContent: () => markdown,
    };
    mocks.files = {
      chatUploadFileList: [{ file: { name: 'A.txt' }, id: 'file-A', status: 'success' }],
      clearChatContextSelections: vi.fn((key: string) => {
        delete mocks.files.selections[key];
      }),
      clearChatUploadFileList: vi.fn((ids?: string[]) => {
        mocks.files.chatUploadFileList = ids
          ? mocks.files.chatUploadFileList.filter((file: any) => !ids.includes(file.id))
          : [];
      }),
      removeChatContextSelection: vi.fn(({ contextKey, id }) => {
        mocks.files.selections[contextKey] = mocks.files.selections[contextKey].filter(
          (item: any) => item.id !== id,
        );
      }),
      restoreChatContextSelections: vi.fn(),
      restoreChatUploadFileList: vi.fn(),
      selections: {},
    };
    mocks.chat = {
      isGatewayModeEnabled: () => true,
      sendMessage: vi.fn().mockResolvedValue(undefined),
    };
    mocks.state = {
      context: { agentId: 'agent-A', topicId: 'topic-A' },
      displayMessages: [],
      editor,
      hooks: {},
      inputMessage: markdown,
      commitScheduledSend: vi.fn().mockResolvedValue(true),
    };
    mocks.store = { getState: () => mocks.state };
    mocks.state.sendMessage = createSendMessage(
      (value) => Object.assign(mocks.state, value),
      () => mocks.state,
    );
    mocks.preflight.mockResolvedValue(undefined);
  });

  it('submits one coherent snapshot and preserves text added during preflight', async () => {
    const pending = deferred();
    mocks.preflight.mockReturnValue(pending.promise);
    const { result } = renderHook(() => useSendMessage({}));
    let sending: any;
    act(() => {
      sending = result.current.handleSend(params);
    });
    markdown = 'New draft';
    document = { root: { text: markdown } };
    mocks.state.inputMessage = markdown;
    await act(async () => {
      pending.resolve();
      await sending;
    });
    expect(markdown).toBe('New draft');
    expect(mocks.state.inputMessage).toBe('New draft');
    expect(mocks.chat.sendMessage.mock.calls[0][0]).toMatchObject({
      editorData: { root: { text: 'Original message' } },
      message: 'Original message',
    });
  });

  it('sends to the original conversation without clearing the restored destination draft', async () => {
    const pending = deferred();
    mocks.preflight.mockReturnValue(pending.promise);
    const { result, rerender } = renderHook(() => useSendMessage({}));
    let sending: any;
    act(() => {
      sending = result.current.handleSend(params);
    });
    mocks.state.context = { agentId: 'agent-B', topicId: 'topic-B' };
    markdown = 'Restored B draft';
    document = { root: { text: markdown } };
    mocks.state.inputMessage = markdown;
    rerender();
    await act(async () => {
      pending.resolve();
      await sending;
    });
    expect(markdown).toBe('Restored B draft');
    expect(mocks.state.inputMessage).toBe('Restored B draft');
    expect(mocks.chat.sendMessage.mock.calls[0][0].context).toEqual({
      agentId: 'agent-A',
      topicId: 'topic-A',
    });
  });

  it('clears only submitted attachments and selections', async () => {
    const pending = deferred();
    mocks.preflight.mockReturnValue(pending.promise);
    const { messageMapKey } = await import('@/store/chat/utils/messageMapKey');
    const key = messageMapKey(mocks.state.context);
    const original = { content: 'original selection', id: 'selection-A', type: 'text' };
    mocks.files.selections[key] = [original];
    const { result } = renderHook(() => useSendMessage({}));
    let sending: any;
    act(() => {
      sending = result.current.handleSend(params);
    });
    mocks.files.chatUploadFileList = [
      ...mocks.files.chatUploadFileList,
      { id: 'file-B', status: 'success' },
    ];
    const added = { content: 'new selection', id: 'selection-B', type: 'text' };
    mocks.files.selections[key] = [original, added];
    await act(async () => {
      pending.resolve();
      await sending;
    });
    expect(mocks.files.chatUploadFileList.map((file: any) => file.id)).toEqual(['file-B']);
    expect(mocks.files.selections[key]).toEqual([added]);
  });

  it('ignores repeated Send during preflight but permits a follow-up during generation', async () => {
    const pending = deferred();
    const generation = deferred();
    mocks.preflight.mockReturnValueOnce(pending.promise).mockResolvedValue(undefined);
    mocks.chat.sendMessage.mockReturnValueOnce(generation.promise);
    const { result } = renderHook(() => useSendMessage({}));
    let sending: any;
    act(() => {
      sending = result.current.handleSend(params);
    });
    let duplicate: any;
    act(() => {
      duplicate = result.current.handleSend(params);
    });
    expect(mocks.preflight).toHaveBeenCalledTimes(1);
    await act(async () => {
      pending.resolve();
      await duplicate;
      await Promise.resolve();
    });
    markdown = 'Follow-up';
    document = { root: { text: markdown } };
    await act(async () => {
      await result.current.handleSend(params);
    });
    expect(mocks.chat.sendMessage).toHaveBeenCalledTimes(2);
    await act(async () => {
      generation.resolve();
      await sending;
    });
  });

  it('keeps the complete draft on preflight rejection and allows retry', async () => {
    mocks.preflight
      .mockRejectedValueOnce(new Error('Directory unavailable'))
      .mockResolvedValue(undefined);
    const { result } = renderHook(() => useSendMessage({}));
    await act(async () => {
      await result.current.handleSend(params);
    });
    expect(markdown).toBe('Original message');
    expect(mocks.files.chatUploadFileList).toHaveLength(1);
    expect(mocks.chat.sendMessage).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.handleSend(params);
    });
    expect(mocks.chat.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('retains edits and later attachments while a scheduled send is persisted', async () => {
    const pending = deferred();
    mocks.state.scheduledSendAt = '2030-01-01T01:00:00Z';
    mocks.state.commitScheduledSend.mockReturnValue(pending.promise.then(() => true));
    const { result } = renderHook(() => useSendMessage({}));
    let sending: any;
    await act(async () => {
      sending = result.current.handleSend(params);
      await Promise.resolve();
    });
    markdown = 'Next scheduled draft';
    document = { root: { text: markdown } };
    mocks.files.chatUploadFileList = [
      ...mocks.files.chatUploadFileList,
      { id: 'file-B', status: 'success' },
    ];
    await act(async () => {
      pending.resolve();
      await sending;
    });
    expect(markdown).toBe('Next scheduled draft');
    expect(mocks.files.chatUploadFileList.map((file: any) => file.id)).toEqual(['file-B']);
    expect(mocks.chat.sendMessage).not.toHaveBeenCalled();
  });

  it.each(['text', 'formatting', 'topic'])(
    'protects a newer %s draft while a before-send hook waits',
    async (change) => {
      const pending = deferred();
      mocks.state.hooks.onBeforeSendMessage = () => pending.promise;
      const { result } = renderHook(() => useSendMessage({}));
      let sending: any;
      await act(async () => {
        sending = result.current.handleSend(params);
        await Promise.resolve();
      });
      expect(clearContent).toHaveBeenCalledTimes(1);
      mocks.state.inputMessage = '';
      if (change === 'topic') mocks.state.context = { agentId: 'agent-B', topicId: 'topic-B' };
      if (change !== 'formatting') mocks.state.inputMessage = markdown = 'New draft';
      // The editor updates before its debounced inputMessage mirror, including
      // rich-text changes that leave the Markdown unchanged.
      document = { root: { text: 'New draft', format: 'bold' } };
      await act(async () => {
        pending.resolve();
        await sending;
      });
      expect(mocks.state.inputMessage).toBe(change === 'formatting' ? '' : 'New draft');
      expect(document).toEqual({ root: { text: 'New draft', format: 'bold' } });
      expect(mocks.chat.sendMessage.mock.calls[0][0]).toMatchObject({
        context: { agentId: 'agent-A', topicId: 'topic-A' },
        message: 'Original message',
        preserveComposer: true,
      });
    },
  );

  it('keeps ordinary failure recovery enabled after an unchanged before-send hook', async () => {
    mocks.state.hooks.onBeforeSendMessage = async () => {};
    const { result } = renderHook(() => useSendMessage({}));
    await act(async () => {
      await result.current.handleSend(params);
    });
    expect(mocks.chat.sendMessage.mock.calls[0][0].preserveComposer).toBe(false);
    expect(mocks.state.inputMessage).toBe('');
  });
});
