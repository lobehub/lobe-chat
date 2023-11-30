import { V1Config, V1ConfigState, V1Session } from '@/migrations/FromV1ToV2/types/v1';
import { MigrationData, VersionController } from '@/migrations/VersionController';

import inputV1Data from './fixtures/input-v1-session.json';
import outputV2Data from './fixtures/output-v2.json';
import { MigrationV1ToV2 } from './index';

describe('MigrationV1ToV2', () => {
  let migrations;
  let versionController: VersionController<any>;

  beforeEach(() => {
    migrations = [MigrationV1ToV2];
    versionController = new VersionController(migrations, 2);
  });

  it('should migrate data correctly through multiple versions', () => {
    const data: MigrationData = inputV1Data;

    const migratedData = versionController.migrate(data);

    expect(migratedData.version).toEqual(outputV2Data.version);
    expect(migratedData.state.sessions).toEqual(outputV2Data.state.sessions);
    expect(migratedData.state.topics).toEqual(outputV2Data.state.topics);
    expect(migratedData.state.messages).toEqual(outputV2Data.state.messages);
  });

  it('should work correctly with session with no topic', () => {
    const data: MigrationData<V1ConfigState> = {
      state: {
        sessions: {
          'f8a620ef-c44f-403e-892c-e97fb745255e': {
            chats: {},
            config: {
              model: 'gpt-3.5-turbo',
              params: {
                temperature: 0.6,
              },
              systemRole:
                '你是一名前端专家。现在我们正在实现一个 zustand store。该store包含 agents、chats、sessionTree 三个关键的数据。它们的类型定义如下：\n\n```ts\n\n\nexport interface ChatSessionState {\n  sessionTree: SessionTree[];\n  chats: ChatContextMap;\n  agents: ChatAgentMap;\n}\n\ninterface SessionTree {\n  agentId: string;\n  chats: string[];\n}\n\nexport type ChatContextMap = Record<string, ChatContext>;\nexport type ChatAgentMap = Record<string, ChatAgent>;\n\n```',
              displayMode: 'chat',
              plugins: [],
            } as unknown as V1Config,
            createAt: 1690016491289,
            id: 'f8a620ef-c44f-403e-892c-e97fb745255e',
            meta: {
              title: '前端 zustand store 专家',
              description: '你需要实现一个 zustand store 的功能',
              avatar: '输出: 🧪',
            },
            type: 'agent',
            updateAt: 1690016491289,
          },
        },
      },
      version: 1,
    };

    const migratedData = versionController.migrate(data);
    expect(migratedData.version).toEqual(2);
    expect(migratedData.state.sessions).toEqual([
      {
        group: 'default',
        config: {
          model: 'gpt-3.5-turbo',
          params: {
            temperature: 0.6,
          },
          systemRole:
            '你是一名前端专家。现在我们正在实现一个 zustand store。该store包含 agents、chats、sessionTree 三个关键的数据。它们的类型定义如下：\n\n```ts\n\n\nexport interface ChatSessionState {\n  sessionTree: SessionTree[];\n  chats: ChatContextMap;\n  agents: ChatAgentMap;\n}\n\ninterface SessionTree {\n  agentId: string;\n  chats: string[];\n}\n\nexport type ChatContextMap = Record<string, ChatContext>;\nexport type ChatAgentMap = Record<string, ChatAgent>;\n\n```',
          displayMode: 'chat',
          plugins: [],
        },
        createdAt: 1690016491289,
        id: 'f8a620ef-c44f-403e-892c-e97fb745255e',
        meta: {
          title: '前端 zustand store 专家',
          description: '你需要实现一个 zustand store 的功能',
          avatar: '输出: 🧪',
        },
        type: 'agent',
        updatedAt: 1690016491289,
      },
    ]);
  });

  it('should add inbox messages', () => {
    const data: MigrationData<V1ConfigState> = {
      state: {
        inbox: {
          type: 'agent',
          updateAt: 12,
          createAt: 12,
          id: 'inbox',
          meta: {},
          config: {} as V1Config,
          chats: {
            HD4krtKa: {
              content: '1',
              createAt: 1692891912689,
              id: 'HD4krtKa',
              meta: {},
              role: 'user',
              updateAt: 1693114820406,
              topicId: 'jvfmUEwF',
            },
            K4AVcvGB: {
              content: '2',
              createAt: 1692891912699,
              id: 'K4AVcvGB',
              meta: {},
              parentId: 'HD4krtKa',
              role: 'assistant',
              updateAt: 1693114820418,
              extra: { fromModel: 'gpt-3.5-turbo' },
              topicId: 'jvfmUEwF',
            },
            QaAUgIGC: {
              content: '3',
              createAt: 1693043755942,
              id: 'QaAUgIGC',
              meta: {},
              role: 'user',
              updateAt: 1693114820428,
              topicId: 'jvfmUEwF',
            },
            jF4p75eF: {
              content: '4',
              createAt: 1693043755952,
              id: 'jF4p75eF',
              meta: {},
              parentId: 'QaAUgIGC',
              role: 'assistant',
              updateAt: 1693114820439,
              extra: { fromModel: 'gpt-3.5-turbo' },
              topicId: 'jvfmUEwF',
            },
          },
          topics: {
            jvfmUEwF: {
              createAt: 1693114820394,
              id: 'jvfmUEwF',
              title: 'JSX错误：children属性类型错误',
              updateAt: 1693114821388,
            },
            IVfDVB5g: {
              createAt: 1693228301335,
              id: 'IVfDVB5g',
              title: '上游服务端错误状态码\n下游服务器错误状态码',
              updateAt: 1693228303288,
            },
          },
        },
      },
      version: 1,
    };

    const migratedData = versionController.migrate(data);

    expect(migratedData.version).toEqual(2);
    expect(migratedData.state.messages).toEqual([
      {
        content: '1',
        createdAt: 1692891912689,
        id: 'HD4krtKa',
        sessionId: 'inbox',
        meta: {},
        role: 'user',
        updatedAt: 1693114820406,
        topicId: 'jvfmUEwF',
      },
      {
        content: '2',
        createdAt: 1692891912699,
        id: 'K4AVcvGB',
        meta: {},
        sessionId: 'inbox',
        parentId: 'HD4krtKa',
        role: 'assistant',
        updatedAt: 1693114820418,
        fromModel: 'gpt-3.5-turbo',
        topicId: 'jvfmUEwF',
      },
      {
        content: '3',
        createdAt: 1693043755942,
        id: 'QaAUgIGC',
        sessionId: 'inbox',
        meta: {},
        role: 'user',
        updatedAt: 1693114820428,
        topicId: 'jvfmUEwF',
      },
      {
        content: '4',
        createdAt: 1693043755952,
        sessionId: 'inbox',
        id: 'jF4p75eF',
        meta: {},
        parentId: 'QaAUgIGC',
        role: 'assistant',
        updatedAt: 1693114820439,
        fromModel: 'gpt-3.5-turbo',
        topicId: 'jvfmUEwF',
      },
    ]);
    expect(migratedData.state.topics).toEqual([
      {
        createdAt: 1693114820394,
        id: 'jvfmUEwF',
        title: 'JSX错误：children属性类型错误',
        sessionId: 'inbox',
        updatedAt: 1693114821388,
      },
      {
        createdAt: 1693228301335,
        id: 'IVfDVB5g',
        title: '上游服务端错误状态码\n下游服务器错误状态码',
        sessionId: 'inbox',
        updatedAt: 1693228303288,
      },
    ]);
  });
});
