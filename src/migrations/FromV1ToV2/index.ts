import type { Migration, MigrationData } from '@/utils/VersionController';

import { V1Chat, V1ConfigState, V1Topic } from './types/v1';
import { V2ConfigState, V2Message, V2Session, V2Topic } from './types/v2';

export class MigrationV1ToV2 implements Migration {
  /***
   * 配置项里的当前版本号
   */
  version = 1;

  migrate(data: MigrationData<V1ConfigState>): MigrationData<V2ConfigState> {
    const v2Messages: V2Message[] = [];
    const v2Topics: V2Topic[] = [];

    const sessions: V2Session[] = Object.values(data.state.sessions).map(
      ({
        chats,
        topics,
        createAt,
        updateAt,
        pinned,

        ...i
      }) => {
        for (const chat of Object.values(chats)) {
          v2Messages.push(this.migrationMessage(i.id, chat));
        }

        for (const chat of Object.values(topics)) {
          v2Topics.push(this.migrationTopic(i.id, chat));
        }

        return {
          ...i,
          createdAt: createAt,
          group: pinned ? 'pinned' : 'default',
          updatedAt: updateAt,
        };
      },
    );
    return {
      ...data,
      state: {
        ...data.state,
        messages: v2Messages,
        sessions,
        topics: v2Topics,
      },
    };
  }

  migrationMessage = (
    sessionId: string,
    { createAt, extra, updateAt, name, function_call, ...chat }: V1Chat,
  ): V2Message => ({
    ...chat,
    createdAt: createAt,
    plugin: function_call
      ? {
          apiName: function_call.name,
          arguments: function_call.arguments,
          identifier: name,
          type: 'default',
        }
      : chat.plugin,
    sessionId,
    updatedAt: updateAt,
    ...extra,
  });

  migrationTopic = (sessionId: string, { createAt, updateAt, ...topic }: V1Topic): V2Topic => ({
    ...topic,
    createdAt: createAt,
    sessionId,
    updatedAt: updateAt,
  });
}
