import { INBOX_SESSION_ID } from '@/const/session';
import type { Migration, MigrationData } from '@/migrations/VersionController';

import { V1Chat, V1ConfigState, V1Session, V1Topic } from './types/v1';
import { V2ConfigState, V2Message, V2Session, V2Topic } from './types/v2';

export class MigrationV1ToV2 implements Migration {
  // from this version to start migration
  version = 1;

  migrateSession = (
    session: V1Session,
    finalMessages: V2Message[],
    finalTopics: V2Topic[],
  ): V2Session => {
    const { chats, topics, createAt, updateAt, pinned, ...i } = session;

    if (chats) {
      for (const chat of Object.values(chats)) {
        finalMessages.push(this.migrationMessage(chat, i.id));
      }
    }

    if (topics) {
      for (const chat of Object.values(topics)) {
        finalTopics.push(this.migrationTopic(i.id, chat));
      }
    }

    return { ...i, createdAt: createAt, group: pinned ? 'pinned' : 'default', updatedAt: updateAt };
  };

  migrate(data: MigrationData<V1ConfigState>): MigrationData<V2ConfigState> {
    const { sessions: v1Session = {}, inbox } = data.state;
    const v2Messages: V2Message[] = [];
    const v2Topics: V2Topic[] = [];

    const sessions: V2Session[] = Object.values(v1Session).map((s) =>
      this.migrateSession(s, v2Messages, v2Topics),
    );

    if (inbox) {
      this.migrateSession({ ...inbox, id: INBOX_SESSION_ID }, v2Messages, v2Topics);
    }

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
    { createAt, extra, updateAt, name, function_call, ...chat }: V1Chat,
    sessionId: string,
  ): V2Message => ({
    ...chat,
    createdAt: createAt,
    plugin: function_call
      ? {
          apiName: function_call.name,
          arguments: function_call.arguments,
          identifier: name!,
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
