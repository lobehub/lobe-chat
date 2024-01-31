import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { ChatStore } from '@/store/chat';
import { initialState } from '@/store/chat/initialState';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { ChatMessage } from '@/types/message';
import { MetaData } from '@/types/meta';
import { merge } from '@/utils/merge';

import { chatSelectors } from './selectors';

vi.mock('i18next', () => ({
  t: vi.fn((key) => key), // Simplified mock return value
}));

const initialStore = initialState as ChatStore;

const mockMessages = [
  {
    id: 'msg1',
    content: 'Hello World',
    role: 'user',
  },
  {
    id: 'msg2',
    content: 'Goodbye World',
    role: 'user',
  },
  {
    id: 'msg3',
    content: 'Function Message',
    role: 'function',
    plugin: {
      arguments: ['arg1', 'arg2'],
      identifier: 'func1',
      type: 'pluginType',
    },
  },
] as ChatMessage[];

const mockedChats = [
  {
    id: 'msg1',
    content: 'Hello World',
    role: 'user',
    meta: {
      avatar: '😀',
    },
  },
  {
    id: 'msg2',
    content: 'Goodbye World',
    role: 'user',
    meta: {
      avatar: '😀',
    },
  },
  {
    id: 'msg3',
    content: 'Function Message',
    role: 'function',
    meta: {
      avatar: '🧩',
      title: 'plugin-unknown',
    },
    plugin: {
      arguments: ['arg1', 'arg2'],
      identifier: 'func1',
      type: 'pluginType',
    },
  },
] as ChatMessage[];

const mockChatStore = { messages: mockMessages } as ChatStore;

describe('chatSelectors', () => {
  describe('getMessageById', () => {
    it('should return undefined if the message with the given id does not exist', () => {
      const message = chatSelectors.getMessageById('non-existent-id')(initialStore);
      expect(message).toBeUndefined();
    });

    it('should return the message object with the matching id', () => {
      const state = merge(initialStore, { messages: mockMessages });
      const message = chatSelectors.getMessageById('msg1')(state);
      expect(message).toEqual(mockMessages[0]);
    });

    it('should return the message with the matching id', () => {
      const message = chatSelectors.getMessageById('msg1')(mockChatStore);
      expect(message).toEqual(mockMessages[0]);
    });

    it('should return undefined if no message matches the id', () => {
      const message = chatSelectors.getMessageById('nonexistent')(mockChatStore);
      expect(message).toBeUndefined();
    });
  });

  describe('getFunctionMessageProps', () => {
    it('should return the properties of a function message', () => {
      const state = merge(initialStore, {
        messages: mockMessages,
        chatLoadingId: 'msg3', // Assuming this id represents a loading state
      });
      const props = chatSelectors.getFunctionMessageProps(mockMessages[2])(state);
      expect(props).toEqual({
        arguments: ['arg1', 'arg2'],
        command: mockMessages[2].plugin,
        content: 'Function Message',
        id: 'func1',
        loading: true,
        type: 'pluginType',
      });
    });

    it('should return loading as false if the message id is not the current loading id', () => {
      const state = merge(initialStore, { messages: mockMessages, chatLoadingId: 'msg1' });
      const props = chatSelectors.getFunctionMessageProps(mockMessages[2])(state);
      expect(props.loading).toBe(false);
    });

    it('should return correct properties when no plugin is present', () => {
      const messageWithoutPlugin = {
        id: 'msg4',
        content: 'No Plugin Message',
        role: 'function',
        // No plugin property
      };
      const state = merge(initialStore, {
        messages: [...mockMessages, messageWithoutPlugin],
        chatLoadingId: 'msg1',
      });
      const props = chatSelectors.getFunctionMessageProps(messageWithoutPlugin)(state);
      expect(props).toEqual({
        arguments: undefined,
        command: undefined,
        content: 'No Plugin Message',
        id: undefined,
        loading: false,
        type: undefined,
      });
    });
  });

  describe('currentChatsWithHistoryConfig', () => {
    it('should slice the messages according to the current agent config', () => {
      const state = merge(initialStore, { messages: mockMessages });

      const chats = chatSelectors.currentChatsWithHistoryConfig(state);
      expect(chats).toHaveLength(3);
      expect(chats).toEqual(mockedChats);
    });
    it('should slice the messages according to config, assuming historyCount is mocked to 2', async () => {
      const state = merge(initialStore, { messages: mockMessages });
      act(() => {
        useGlobalStore.setState({
          settings: { defaultAgent: { config: { historyCount: 2, enableHistoryCount: true } } },
        });
      });

      const chats = chatSelectors.currentChatsWithHistoryConfig(state);

      expect(chats).toHaveLength(2);
      expect(chats).toEqual([
        {
          id: 'msg2',
          content: 'Goodbye World',
          role: 'user',
          meta: {
            avatar: '😀',
          },
        },
        {
          id: 'msg3',
          content: 'Function Message',
          role: 'function',
          meta: {
            avatar: '🧩',
            title: 'plugin-unknown',
          },
          plugin: {
            arguments: ['arg1', 'arg2'],
            identifier: 'func1',
            type: 'pluginType',
          },
        },
      ]);
    });
  });

  describe('currentChatsWithGuideMessage', () => {
    it('should return existing messages if there are any', () => {
      const state = merge(initialStore, { messages: mockMessages, activeId: 'someActiveId' });
      const chats = chatSelectors.currentChatsWithGuideMessage({} as MetaData)(state);
      expect(chats).toEqual(mockedChats);
    });

    it('should add a guide message if the chat is brand new', () => {
      const state = merge(initialStore, { messages: [], activeId: 'someActiveId' });
      const metaData = { title: 'Mock Agent', description: 'Mock Description' };

      const chats = chatSelectors.currentChatsWithGuideMessage(metaData)(state);

      expect(chats).toHaveLength(1);
      expect(chats[0].content).toBeDefined();
      expect(chats[0].meta.avatar).toEqual(DEFAULT_INBOX_AVATAR);
      expect(chats[0].meta).toEqual(expect.objectContaining(metaData));
    });

    it('should use inbox message for INBOX_SESSION_ID', () => {
      const state = merge(initialStore, { messages: [], activeId: INBOX_SESSION_ID });
      const metaData = { title: 'Mock Agent', description: 'Mock Description' };

      const chats = chatSelectors.currentChatsWithGuideMessage(metaData)(state);

      expect(chats[0].content).toEqual('inbox.defaultMessage'); // Assuming translation returns a string containing this
    });

    it('should use agent default message for non-inbox sessions', () => {
      const state = merge(initialStore, { messages: [], activeId: 'someActiveId' });
      const metaData = { title: 'Mock Agent' };

      const chats = chatSelectors.currentChatsWithGuideMessage(metaData)(state);

      expect(chats[0].content).toMatch('agentDefaultMessage'); // Assuming translation returns a string containing this
    });
  });

  describe('chatsMessageString', () => {
    it('should concatenate the contents of all messages returned by currentChatsWithHistoryConfig', () => {
      // Prepare a state with a few messages
      const state = merge(initialStore, {
        messages: mockMessages,
        activeId: 'active-session',
      });

      // Assume that the currentChatsWithHistoryConfig will return the last two messages
      const expectedString = mockMessages
        .slice(-2)
        .map((m) => m.content)
        .join('');

      // Call the selector and verify the result
      const concatenatedString = chatSelectors.chatsMessageString(state);
      expect(concatenatedString).toBe(expectedString);

      // Restore the mocks after the test
      vi.restoreAllMocks();
    });
  });
});
