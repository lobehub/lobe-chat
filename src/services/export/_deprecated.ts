import { Migration } from '@/migrations';
import { messageService } from '@/services/message';
import { sessionService } from '@/services/session';
import { topicService } from '@/services/topic';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import {
  ConfigFileAgents,
  ConfigFileAll,
  ConfigFileSessions,
  ConfigFileSettings,
  ConfigFileSingleSession,
  ConfigModelMap,
  ExportType,
} from '@/types/exportConfig';

type CreateConfigFileState<T extends ExportType> = ConfigModelMap[T]['state'];

type CreateConfigFile<T extends ExportType> = ConfigModelMap[T]['file'];

const createConfigFile = <T extends ExportType>(
  type: T,
  state: CreateConfigFileState<T>,
): CreateConfigFile<T> => {
  switch (type) {
    case 'agents': {
      return {
        exportType: 'agents',
        state,
        version: Migration.targetVersion,
      } as ConfigFileAgents;
    }

    case 'sessions': {
      return {
        exportType: 'sessions',
        state,
        version: Migration.targetVersion,
      } as ConfigFileSessions;
    }

    case 'settings': {
      return {
        exportType: 'settings',
        state,
        version: Migration.targetVersion,
      } as ConfigFileSettings;
    }

    case 'singleSession': {
      return {
        exportType: 'sessions',
        state,
        version: Migration.targetVersion,
      } as ConfigFileSingleSession;
    }

    case 'all': {
      return {
        exportType: 'all',
        state,
        version: Migration.targetVersion,
      } as ConfigFileAll;
    }
  }

  throw new Error('缺少正确的导出类型，请检查实现...');
};

/**
 * @deprecated
 */
export class ConfigService {
  /**
   * export all agents
   */
  exportAgents = async () => {
    const agents = await sessionService.getSessionsByType('agent');
    const sessionGroups = await sessionService.getSessionGroups();

    return createConfigFile('agents', { sessionGroups, sessions: agents });
  };

  /**
   * export all sessions
   */
  exportSessions = async () => {
    const sessions = await sessionService.getSessionsByType();
    const sessionGroups = await sessionService.getSessionGroups();
    const messages = await messageService.getAllMessages();
    const topics = await topicService.getAllTopics();

    return createConfigFile('sessions', { messages, sessionGroups, sessions, topics });
  };

  /**
   * export a session
   */
  exportSingleSession = async (id: string) => {
    const session = this.getSession(id);
    if (!session) return;

    const messages = await messageService.getAllMessagesInSession(id);
    const topics = await topicService.getTopics({ containerId: id });

    const config = createConfigFile('singleSession', { messages, sessions: [session], topics });
    return { config, title: `${session.meta?.title}-session` };
  };

  exportSingleAgent = async (id: string) => {
    const agent = this.getAgent(id);
    if (!agent) return;

    const config = createConfigFile('agents', { sessionGroups: [], sessions: [agent] });

    return { config, title: `${agent.meta?.title}-session` };
  };

  /**
   * export settings
   */
  exportSettings = async () => {
    const settings = this.getSettings();

    return createConfigFile('settings', { settings });
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

    return createConfigFile('all', { messages, sessionGroups, sessions, settings, topics });
  };

  private getSettings = () => settingsSelectors.exportSettings(useUserStore.getState());

  private getSession = (id: string) =>
    sessionSelectors.getSessionById(id)(useSessionStore.getState());

  private getAgent = (id: string) =>
    sessionSelectors.getSessionById(id)(useSessionStore.getState());
}

/**
 * @deprecated
 */
export const configService = new ConfigService();
