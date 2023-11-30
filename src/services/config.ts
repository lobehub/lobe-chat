import { messageService } from '@/services/message';
import { sessionService } from '@/services/session';
import { topicService } from '@/services/topic';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionExportSelectors, sessionSelectors } from '@/store/session/selectors';
import { ChatMessage } from '@/types/chatMessage';
import { ConfigFile } from '@/types/exportConfig';
import { LobeSessions } from '@/types/session';
import { GlobalSettings } from '@/types/settings';
import { ChatTopic } from '@/types/topic';
import { createConfigFile, exportConfigFile } from '@/utils/config';

export interface ImportResult {
  added: number;
  errors: number;
  skips: number;
}
export interface ImportResults {
  messages?: ImportResult;
  sessions: ImportResult;
  topics?: ImportResult;
}

class ConfigService {
  /**
   * import sessions from files
   * @param sessions
   */
  importSessions = async (sessions: LobeSessions) => {
    return await sessionService.batchCreateSessions(sessions);
  };
  importMessages = async (messages: ChatMessage[]) => {
    return messageService.batchCreate(messages);
  };
  importSettings = async (settings: GlobalSettings) => {
    useGlobalStore.getState().importAppSettings(settings);
  };
  importTopics = async (topics: ChatTopic[]) => {
    return topicService.batchCreateTopics(topics);
  };

  importConfigState = async (config: ConfigFile): Promise<ImportResults | undefined> => {
    switch (config.exportType) {
      case 'settings': {
        await this.importSettings(config.state.settings);

        break;
      }

      case 'agents': {
        const data = await this.importSessions(config.state.sessions);
        return {
          sessions: this.mapImportResult(data),
        };
      }

      case 'all': {
        await this.importSettings(config.state.settings);

        const [sessions, messages, topics] = await Promise.all([
          this.importSessions(config.state.sessions),
          this.importMessages(config.state.messages),
          this.importTopics(config.state.topics),
        ]);

        return {
          messages: this.mapImportResult(messages),
          sessions: this.mapImportResult(sessions),
          topics: this.mapImportResult(topics),
        };
      }

      case 'sessions': {
        const [sessions, messages, topics] = await Promise.all([
          this.importSessions(config.state.sessions),
          this.importMessages(config.state.messages),
          this.importTopics(config.state.topics),
        ]);

        return {
          messages: this.mapImportResult(messages),
          sessions: this.mapImportResult(sessions),
          topics: this.mapImportResult(topics),
        };
      }
    }
  };

  /**
   * export all agents
   */
  exportAgents = async () => {
    const agents = await sessionService.getAllAgents();

    const config = createConfigFile('agents', { sessions: agents });

    exportConfigFile(config, 'agents');
  };

  /**
   * export all sessions
   */
  exportSessions = async () => {
    const sessions = await sessionService.getSessions();
    const messages = await messageService.getAllMessages();
    const topics = await topicService.getAllTopics();

    const config = createConfigFile('sessions', { messages, sessions, topics });

    exportConfigFile(config, 'sessions');
  };

  /**
   * export a session
   */
  exportSingleSession = async (id: string) => {
    const session = this.getSession(id);
    if (!session) return;

    const messages = await messageService.getAllMessagesInSession(id);
    const topics = await topicService.getTopics({ sessionId: id });

    const config = createConfigFile('singleSession', { messages, sessions: [session], topics });

    exportConfigFile(config, `${session.meta?.title}-session`);
  };

  exportSingleAgent = async (id: string) => {
    const agent = this.getAgent(id);
    if (!agent) return;

    const config = createConfigFile('agents', { sessions: [agent] });

    exportConfigFile(config, agent.meta?.title || 'agent');
  };

  /**
   * export settings
   */
  exportSettings = async () => {
    const settings = this.getSettings();

    const config = createConfigFile('settings', { settings });

    exportConfigFile(config, 'settings');
  };

  /**
   * export all data
   */
  exportAll = async () => {
    const sessions = await sessionService.getSessions();
    const messages = await messageService.getAllMessages();
    const topics = await topicService.getAllTopics();
    const settings = this.getSettings();

    const config = createConfigFile('all', { messages, sessions, settings, topics });

    exportConfigFile(config, 'config');
  };

  private getSettings = () => settingsSelectors.exportSettings(useGlobalStore.getState());

  private getSession = (id: string) =>
    sessionSelectors.getSessionById(id)(useSessionStore.getState());

  private getAgent = (id: string) =>
    sessionExportSelectors.getExportAgent(id)(useSessionStore.getState());

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

export const configService = new ConfigService();
