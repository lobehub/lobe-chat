import { beforeEach, describe } from 'vitest';

import { ChatMessage } from '@/types/chatMessage';
import { LobeAgentSession } from '@/types/session';

import { organizeChats } from './utils';

let session: LobeAgentSession;

beforeEach(() => {
  session = {
    chats: {
      '1': {
        id: '1',
        createAt: 1639440000000,
        updateAt: 1639440000000,
        meta: {},
        content: 'Message 1',
        role: 'assistant',
      },
      '2': {
        id: '2',
        createAt: 1639450000000,
        updateAt: 1639450000000,
        meta: {},
        content: 'Message 2',
        role: 'user',
      },
      '3': {
        id: '3',
        createAt: 1639460000000,
        updateAt: 1639460000000,
        meta: {},
        content: 'Message 3',
        role: 'assistant',
      },
    },
    config: {
      model: 'gpt-4',
      params: {
        temperature: 0.6,
      },
      systemRole: '',
    },
    type: 'agent',
    createAt: 1690110700808,
    id: 'abc',
    meta: {},
    updateAt: 1690110700808,
  } as LobeAgentSession;
});

describe('organizeChats', () => {
  it('should return an array of chat messages', () => {
    const result = organizeChats(session);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });

  it('should sort chat messages in ascending order of createAt', () => {
    const result = organizeChats(session);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });

  it('should filter out archived messages', () => {
    session.chats['2'].topicId = '123';
    const result = organizeChats(session);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');
  });

  it('should map avatars correctly', () => {
    const avatar = 'https://example.com/avatar.png';
    const settings = {
      avatar: 'https://example.com/user-avatar.png',
    };

    const result = organizeChats(session, {
      meta: {
        user: { avatar: settings.avatar },
        assistant: { avatar },
      },
    });

    expect(result[0].meta.avatar).toBe(avatar);
    expect(result[1].meta.avatar).toBe(settings.avatar);
    expect(result[2].meta.avatar).toBe(avatar);
  });

  it('should reorder messages based on parent-child relationship', () => {
    session.chats['2'].parentId = '1';
    session.chats['3'].parentId = '2';
    const result = organizeChats(session);
    expect(result.length).toBe(3);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });

  it('should remove duplicate messages', () => {
    session.chats['2'].parentId = '1';
    session.chats['3'].parentId = '2';
    session.chats['3'].id = '2';
    const result = organizeChats(session);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  it('should return an empty array for empty session', () => {
    const emptySession = {
      chats: {},
      config: {},
      type: 'agent',
    } as LobeAgentSession;
    const result = organizeChats(emptySession);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it('should handle large number of chat messages', () => {
    const largeSession = {
      chats: {},
      config: {},
      type: 'agent',
      meta: {},
    } as LobeAgentSession;

    const numMessages = 1000;

    for (let i = 1; i <= numMessages; i++) {
      largeSession.chats[i.toString()] = {
        id: i.toString(),
        createAt: i,
        updateAt: i,
        meta: {},
        content: `Message ${i}`,
        role: 'assistant',
      };
    }

    const result = organizeChats(largeSession);
    expect(result.length).toBe(numMessages);
    expect(result[0].id).toBe('1');
    expect(result[numMessages - 1].id).toBe(numMessages.toString());
  });

  it('按照预期进行排序', () => {
    const realSession = {
      chats: {
        'Ftei28dF': {
          content: '鲁迅为何暴打周树人',
          createAt: 1690111354731,
          id: 'Ftei28dF',
          meta: {},
          role: 'user',
          updateAt: 1690111354731,
        },
        '9bQW9hTs': {
          content:
            '这是一种误解。鲁迅和周树人是同一人，指的都是现代文学家周樟寿。"鲁迅"是他的笔名，"周树人"则是他的原名。所以，鲁迅并没有暴打周树人，这只是一种说法上的误解。',
          createAt: 1690111354734,
          id: '9bQW9hTs',
          meta: {},
          parentId: 'Ftei28dF',
          role: 'assistant',
          updateAt: 1690111361514,
          extra: {
            fromModel: 'gpt-4',
          },
        },
        'HRQGSszU': {
          content:
            '这个问题基于一个误解。实际上，鲁迅和周树人是同一个人，这是中国现代文学的开山鼻祖周树人的笔名。他的本名是周树人，鲁迅则是他在30岁时开始使用的笔名。因此，鲁迅不能暴打周树人，因为他们是同一个人。',
          createAt: 1690111364344,
          id: 'HRQGSszU',
          meta: {},
          parentId: 'Ftei28dF',
          role: 'assistant',
          updateAt: 1690111369519,
          extra: {
            fromModel: 'gpt-4',
          },
        },
        '981qr9n0': {
          content:
            '这是一个误解。鲁迅和周树人是同一个人，是中国现代文学的奠基人。鲁迅是他的笔名，周树人是他的本名。所以，鲁迅不可能暴打周树人。这种说法可能是源于一些误解或误传。',
          createAt: 1690111375456,
          id: '981qr9n0',
          meta: {},
          parentId: 'Ftei28dF',
          role: 'assistant',
          updateAt: 1690111381458,
          extra: {
            fromModel: 'gpt-4',
          },
        },
        'ddd': {
          content: '鲁迅是谁',
          createAt: 1690211354731,
          id: 'ddd',
          meta: {},
          role: 'user',
          updateAt: 1690211354731,
        },
      },
      config: {
        model: 'gpt-4',
        params: {
          temperature: 0.6,
        },
        systemRole: '',
      },
      createAt: 1690110700808,
      id: '1515e861-0c64-49a3-bb85-2b24d65a19d6',
      meta: {},
      type: 'agent',
      updateAt: 1690110700808,
    } as LobeAgentSession;

    const result = organizeChats(realSession);

    expect(
      result.map((i) => ({ id: i.id, content: i.content, role: i.role, createAt: i.createAt })),
    ).toEqual([
      {
        content: '鲁迅为何暴打周树人',
        createAt: 1690111354731,
        id: 'Ftei28dF',
        role: 'user',
      },
      {
        content:
          '这是一种误解。鲁迅和周树人是同一人，指的都是现代文学家周樟寿。"鲁迅"是他的笔名，"周树人"则是他的原名。所以，鲁迅并没有暴打周树人，这只是一种说法上的误解。',
        createAt: 1690111354734,
        id: '9bQW9hTs',
        role: 'assistant',
      },
      {
        content:
          '这个问题基于一个误解。实际上，鲁迅和周树人是同一个人，这是中国现代文学的开山鼻祖周树人的笔名。他的本名是周树人，鲁迅则是他在30岁时开始使用的笔名。因此，鲁迅不能暴打周树人，因为他们是同一个人。',
        createAt: 1690111364344,
        id: 'HRQGSszU',
        role: 'assistant',
      },
      {
        content:
          '这是一个误解。鲁迅和周树人是同一个人，是中国现代文学的奠基人。鲁迅是他的笔名，周树人是他的本名。所以，鲁迅不可能暴打周树人。这种说法可能是源于一些误解或误传。',
        createAt: 1690111375456,
        id: '981qr9n0',
        role: 'assistant',
      },
      {
        content: '鲁迅是谁',
        createAt: 1690211354731,
        id: 'ddd',
        role: 'user',
      },
    ]);
  });

  const params = {
    meta: {
      user: { avatar: 'user-avatar' },
      assistant: { avatar: 'assistant-avatar' },
    },
  };

  it('should organize chats in chronological order when topicId is not provided', () => {
    const result = organizeChats(session, params);

    expect(result.length).toBe(3);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });

  it('should only return chats with specified topicId when topicId is provided', () => {
    const result = organizeChats(session, { ...params, topicId: 'topic-id' });

    expect(result.length).toBe(0);
  });

  describe('user Meta', () => {
    it('should return correct meta for user role', () => {
      const result = organizeChats(session, params);
      const meta = result[1].meta;

      expect(meta.avatar).toBe(params.meta.user.avatar);
    });

    it('should return correct meta for assistant role', () => {
      const result = organizeChats(session, params);
      const meta = result[0].meta;

      expect(meta.avatar).toBe('assistant-avatar');
      expect(meta.title).toBeUndefined();
    });

    describe('should return correct meta for function role', () => {
      it('找不到插件', () => {
        const message = {
          id: '4',
          createAt: 1927785600004,
          updateAt: 1927785600004,
          role: 'function',
          function_call: {
            name: 'plugin-name',
          },
        } as ChatMessage;

        session.chats[message.id] = message;

        const result = organizeChats(session, params);
        const meta = result[3].meta;

        expect(meta.avatar).toBe('🧩');
        expect(meta.title).toBe('plugin-unknown');
      });

      it('找到的插件', () => {
        const message = {
          id: '4',
          createAt: 1927785600004,
          updateAt: 1927785600004,
          role: 'function',
          function_call: {
            name: 'realtimeWeather',
          },
          name: 'realtimeWeather',
        } as ChatMessage;

        session.chats[message.id] = message;

        const result = organizeChats(session, {
          ...params,
          pluginList: [
            {
              identifier: 'realtimeWeather',
              author: '123',
              meta: {
                avatar: '🧩',
                title: '天气预报',
              },
              createAt: 'abc',
              manifest: '',
              homepage: '',
              schemaVersion: 1,
            },
          ],
        });
        const meta = result[3].meta;

        expect(meta.avatar).toBe('🧩');
        expect(meta.title).toBe('realtimeWeather');
      });
    });
  });
});
