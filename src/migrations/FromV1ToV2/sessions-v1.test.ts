import { V1Config, V1ConfigState, V1Session } from '@/migrations/FromV1ToV2/types/v1';
import { MigrationData, VersionController } from '@/utils/VersionController';

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
});
