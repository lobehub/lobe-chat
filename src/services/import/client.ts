import { MessageModel } from '@/database/client/models/message';
import { SessionModel } from '@/database/client/models/session';
import { SessionGroupModel } from '@/database/client/models/sessionGroup';
import { TopicModel } from '@/database/client/models/topic';
import { ImportResult, ImportResults } from '@/services/config';
import { useUserStore } from '@/store/user';
import { ConfigStateSessions } from '@/types/exportConfig';
import { UserSettings } from '@/types/user/settings';

export class ClientService {
  importSettings = async (settings: UserSettings) => {
    await useUserStore.getState().importAppSettings(settings);
  };

  importData = async (config: ConfigStateSessions): Promise<ImportResults> => {
    const { messages, sessionGroups, sessions, topics } = config;

    let messageResult: ImportResult | undefined;
    let sessionResult: ImportResult | undefined;
    let sessionGroupResult: ImportResult | undefined;
    let topicResult: ImportResult | undefined;

    if (messages.length > 0) {
      const res = await MessageModel.batchCreate(messages);
      messageResult = this.mapImportResult(res);
    }

    if (sessionGroups.length > 0) {
      const res = await SessionGroupModel.batchCreate(sessionGroups);
      sessionGroupResult = this.mapImportResult(res);
    }

    if (topics.length > 0) {
      const res = await TopicModel.batchCreate(topics as any);
      topicResult = this.mapImportResult(res);
    }

    if (sessions.length > 0) {
      const data = await SessionModel.batchCreate(sessions);
      sessionResult = this.mapImportResult(data);
    }

    return {
      messages: messageResult,
      sessionGroups: sessionGroupResult,
      sessions: sessionResult,
      topics: topicResult,
    };
  };

  private mapImportResult = (input: {
    added: number;
    errors?: Error[];
    skips: string[];
  }): ImportResult => {
    return {
      added: input.added,
      errors: input.errors?.length || 0,
      skips: input.skips.length,
    };
  };
}
