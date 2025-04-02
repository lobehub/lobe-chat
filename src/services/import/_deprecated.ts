import { MessageModel } from '@/database/_deprecated/models/message';
import { SessionModel } from '@/database/_deprecated/models/session';
import { SessionGroupModel } from '@/database/_deprecated/models/sessionGroup';
import { TopicModel } from '@/database/_deprecated/models/topic';
import { useUserStore } from '@/store/user';
import { ConfigFile } from '@/types/exportConfig';
import { ImportStage, ImporterEntryData, OnImportCallbacks } from '@/types/importer';
import { UserSettings } from '@/types/user/settings';

export interface ImportResult {
  added: number;
  errors: number;
  skips: number;
  updated?: number;
}
export interface ImportResults {
  messages?: ImportResult;
  sessionGroups?: ImportResult;
  sessions?: ImportResult;
  topics?: ImportResult;
  type?: string;
}

export class ClientService {
  importSettings = async (settings: UserSettings) => {
    await useUserStore.getState().importAppSettings(settings);
  };

  importData = async (
    config: ImporterEntryData,
    callbacks?: OnImportCallbacks,
  ): Promise<ImportResults> => {
    callbacks?.onStageChange?.(ImportStage.Importing);
    const time = Date.now();

    const { messages = [], sessionGroups = [], sessions = [], topics = [] } = config;

    let messageResult: ImportResult | undefined;
    let sessionResult: ImportResult | undefined;
    let sessionGroupResult: ImportResult | undefined;
    let topicResult: ImportResult | undefined;

    if (messages.length > 0) {
      const res = await MessageModel.batchCreate(messages as any);
      messageResult = this.mapImportResult(res);
    }

    if (sessionGroups.length > 0) {
      const res = await SessionGroupModel.batchCreate(sessionGroups as any);
      sessionGroupResult = this.mapImportResult(res);
    }

    if (topics.length > 0) {
      const res = await TopicModel.batchCreate(topics as any);
      topicResult = this.mapImportResult(res);
    }

    if (sessions.length > 0) {
      const data = await SessionModel.batchCreate(sessions as any);
      sessionResult = this.mapImportResult(data);
    }

    const result = {
      messages: messageResult,
      sessionGroups: sessionGroupResult,
      sessions: sessionResult,
      topics: topicResult,
    };

    const duration = Date.now() - time;
    callbacks?.onStageChange?.(ImportStage.Success);
    callbacks?.onSuccess?.(result, duration);

    return result;
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

  importConfigState = async (config: ConfigFile, callbacks?: OnImportCallbacks): Promise<void> => {
    if (config.exportType === 'settings') {
      await this.importSettings(config.state.settings);
      callbacks?.onStageChange?.(ImportStage.Success);
      return;
    }

    if (config.exportType === 'all') {
      await this.importSettings(config.state.settings);
    }

    await this.importData(
      {
        messages: (config.state as any).messages || [],
        sessionGroups: (config.state as any).sessionGroups || [],
        sessions: (config.state as any).sessions || [],
        topics: (config.state as any).topics || [],
        version: config.version,
      },
      callbacks,
    );
  };

  importPgData = async () => {
    throw new Error('Not implemented');
  };
}
