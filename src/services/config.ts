import { importService } from '@/services/import';
import { messageService } from '@/services/message';
import { sessionService } from '@/services/session';
import { topicService } from '@/services/topic';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { ConfigFile } from '@/types/exportConfig';
import { ImportStage, OnImportCallbacks } from '@/types/importer';
import { createConfigFile, exportConfigFile } from '@/utils/config';

export interface ImportResult {
  added: number;
  errors: number;
  skips: number;
}
export interface ImportResults {
  messages?: ImportResult;
  sessionGroups?: ImportResult;
  sessions?: ImportResult;
  topics?: ImportResult;
  type?: string;
}

/**
 * @deprecated
 */
class ConfigService {
  importConfigState = async (config: ConfigFile, callbacks?: OnImportCallbacks): Promise<void> => {
    if (config.exportType === 'settings') {
      await importService.importSettings(config.state.settings);
      callbacks?.onStageChange?.(ImportStage.Success);
      return;
    }

    if (config.exportType === 'all') {
      await importService.importSettings(config.state.settings);
    }

    await importService.importData(
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

  // TODO: Separate export feature into a new service like importService

  /**
   * export all agents
   */
  exportAgents = async () => {
    const agents = await sessionService.getSessionsByType('agent');
    const sessionGroups = await sessionService.getSessionGroups();

    const config = createConfigFile('agents', { sessionGroups, sessions: agents });

    exportConfigFile(config, 'agents');
  };

  /**
   * export all sessions
   */
  exportSessions = async () => {
    const sessions = await sessionService.getSessionsByType();
    const sessionGroups = await sessionService.getSessionGroups();
    const messages = await messageService.getAllMessages();
    const topics = await topicService.getAllTopics();

    const config = createConfigFile('sessions', { messages, sessionGroups, sessions, topics });

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

  /**
   * export a topic
   */
  exportSingleTopic = async (sessionId: string, topicId: string) => {
    const session = this.getSession(sessionId);
    if (!session) return;

    const messages = await messageService.getMessages(sessionId, topicId);
    const topics = await topicService.getTopics({ sessionId });

    const topic = topics.find((item) => item.id === topicId);
    if (!topic) return;

    const config = createConfigFile('singleSession', {
      messages,
      sessions: [session],
      topics: [topic],
    });

    exportConfigFile(config, `${topic.title}-topic`);
  };

  exportSingleAgent = async (id: string) => {
    const agent = this.getAgent(id);
    if (!agent) return;

    const config = createConfigFile('agents', { sessionGroups: [], sessions: [agent] });

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
    const sessions = await sessionService.getSessionsByType();
    const sessionGroups = await sessionService.getSessionGroups();
    const messages = await messageService.getAllMessages();
    const topics = await topicService.getAllTopics();
    const settings = this.getSettings();

    const config = createConfigFile('all', { messages, sessionGroups, sessions, settings, topics });

    exportConfigFile(config, 'config');
  };

  private getSettings = () => settingsSelectors.exportSettings(useUserStore.getState());

  private getSession = (id: string) =>
    sessionSelectors.getSessionById(id)(useSessionStore.getState());

  private getAgent = (id: string) =>
    sessionSelectors.getSessionById(id)(useSessionStore.getState());
}

export const configService = new ConfigService();
