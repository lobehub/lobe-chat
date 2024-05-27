import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { useAgentStore } from '@/store/agent';
import { ChatStore } from '@/store/chat';
import { initialState } from '@/store/chat/initialState';
import { messageMapKey } from '@/store/chat/slices/message/utils';
import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { LobeAgentConfig } from '@/types/agent';
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
    role: 'tool',
    tools: [
      {
        arguments: ['arg1', 'arg2'],
        identifier: 'func1',
        apiName: 'ttt',
        type: 'pluginType',
        id: 'abc',
      },
    ],
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
    role: 'tool',
    meta: {
      avatar: '🤯',
      backgroundColor: 'rgba(0,0,0,0)',
      description: 'inbox.desc',
      title: 'inbox.title',
    },
    tools: [
      {
        arguments: ['arg1', 'arg2'],
        identifier: 'func1',
        apiName: 'ttt',
        type: 'pluginType',
        id: 'abc',
      },
    ],
  },
] as ChatMessage[];

const mockChatStore = {
  messagesMap: {
    [messageMapKey('abc')]: mockMessages,
  },
  activeId: 'abc',
} as ChatStore;

describe('chatSelectors', () => {
  describe('getMessageById', () => {
    it('should return undefined if the message with the given id does not exist', () => {
      const message = chatSelectors.getMessageById('non-existent-id')(initialStore);
      expect(message).toBeUndefined();
    });

    it('should return the message object with the matching id', () => {
      const state = merge(initialStore, {
        messagesMap: {
          [messageMapKey('abc')]: mockMessages,
        },
        activeId: 'abc',
      });
      const message = chatSelectors.getMessageById('msg1')(state);
      expect(message).toEqual(mockedChats[0]);
    });

    it('should return the message with the matching id', () => {
      const message = chatSelectors.getMessageById('msg1')(mockChatStore);
      expect(message).toEqual(mockedChats[0]);
    });

    it('should return undefined if no message matches the id', () => {
      const message = chatSelectors.getMessageById('nonexistent')(mockChatStore);
      expect(message).toBeUndefined();
    });
  });

  describe('currentChatsWithHistoryConfig', () => {
    it('should slice the messages according to the current agent config', () => {
      const state = merge(initialStore, {
        messagesMap: {
          [messageMapKey('abc')]: mockMessages,
        },
        activeId: 'abc',
      });

      const chats = chatSelectors.currentChatsWithHistoryConfig(state);
      expect(chats).toHaveLength(3);
      expect(chats).toEqual(mockedChats);
    });
    it('should slice the messages according to config, assuming historyCount is mocked to 2', async () => {
      const state = merge(initialStore, {
        messagesMap: {
          [messageMapKey('abc')]: mockMessages,
        },
        activeId: 'abc',
      });
      act(() => {
        useAgentStore.setState({
          activeId: 'inbox',
          agentConfig: {
            chatConfig: {
              historyCount: 2,
              enableHistoryCount: true,
            },
            model: 'abc',
          } as LobeAgentConfig,
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
          role: 'tool',
          meta: {
            avatar: '🤯',
            backgroundColor: 'rgba(0,0,0,0)',
            description: 'inbox.desc',
            title: 'inbox.title',
          },
          tools: [
            {
              apiName: 'ttt',
              arguments: ['arg1', 'arg2'],
              identifier: 'func1',
              id: 'abc',
              type: 'pluginType',
            },
          ],
        },
      ]);
    });
  });

  describe('currentChatsWithGuideMessage', () => {
    it('should return existing messages if there are any', () => {
      const state = merge(initialStore, {
        messagesMap: {
          [messageMapKey('someActiveId')]: mockMessages,
        },
        activeId: 'someActiveId',
      });
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

      expect(chats[0].content).toEqual(''); // Assuming translation returns a string containing this
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
        messagesMap: {
          [messageMapKey('active-session')]: mockMessages,
        },
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

  describe('showInboxWelcome', () => {
    it('should return false if the active session is not the inbox session', () => {
      const state = merge(initialStore, { activeId: 'someActiveId' });
      const result = chatSelectors.showInboxWelcome(state);
      expect(result).toBe(false);
    });

    it('should return false if there are existing messages in the inbox session', () => {
      const state = merge(initialStore, {
        activeId: INBOX_SESSION_ID,
        messagesMap: {
          [messageMapKey('inbox')]: mockMessages,
        },
      });
      const result = chatSelectors.showInboxWelcome(state);
      expect(result).toBe(false);
    });

    it('should return true if the active session is the inbox session and there are no existing messages', () => {
      const state = merge(initialStore, {
        activeId: INBOX_SESSION_ID,
        messages: [],
      });
      const result = chatSelectors.showInboxWelcome(state);
      expect(result).toBe(true);
    });
  });
});
