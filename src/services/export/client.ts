import { IExportService } from '@/services/export/type';
import { getAgent, getSession, getSettings } from '@/services/export/utils';
import { ClientService as MessageService } from '@/services/message/client';
import { ClientService as SessionService } from '@/services/session/client';
import { ClientService as TopicService } from '@/services/topic/client';
import { createConfigFile, exportConfigFile } from '@/utils/config';

const sessionService = new SessionService();
const messageService = new MessageService();
const topicService = new TopicService();

export class ClientService implements IExportService {
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
    const session = getSession(id);
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
    const session = getSession(sessionId);
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
    const agent = getAgent(id);
    if (!agent) return;

    const config = createConfigFile('agents', { sessionGroups: [], sessions: [agent] });

    exportConfigFile(config, agent.meta?.title || 'agent');
  };

  /**
   * export settings
   */
  exportSettings = async () => {
    const settings = getSettings();

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
    const settings = getSettings();

    const config = createConfigFile('all', { messages, sessionGroups, sessions, settings, topics });

    exportConfigFile(config, 'config');
  };
}
