import { messageService } from '@/services/message';
import { sessionService } from '@/services/session';
import { topicService } from '@/services/topic';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionExportSelectors, sessionSelectors } from '@/store/session/selectors';
import { createConfigFile, exportConfigFile } from '@/utils/config';

const getSession = (id: string) => sessionSelectors.getSessionById(id)(useSessionStore.getState());
const getSettings = () => settingsSelectors.exportSettings(useGlobalStore.getState());

// =============   导出所有角色   ============= //

export const exportAgents = async () => {
  const agents = sessionExportSelectors.exportAgents(useSessionStore.getState());

  const config = createConfigFile('agents', agents);

  exportConfigFile(config, 'agents');
};

// =============   导出单个角色   ============= //

const getAgent = (id: string) =>
  sessionExportSelectors.getExportAgent(id)(useSessionStore.getState());

export const exportSingleAgent = async (id: string) => {
  const agent = getAgent(id);
  if (!agent) return;

  const config = createConfigFile('agents', { sessions: [agent] });

  exportConfigFile(config, agent.meta?.title || 'agent');
};

// =============   导出所有会话   ============= //

export const exportSessions = async () => {
  const sessions = await sessionService.getSessions();
  const messages = await messageService.getAllMessages();
  const topics = await topicService.getAllTopics();

  const config = createConfigFile('sessions', { messages, sessions, topics });

  exportConfigFile(config, 'sessions');
};

// =============   导出单个会话   ============= //
export const exportSingleSession = async (id: string) => {
  const session = getSession(id);
  if (!session) return;

  const messages = await messageService.getMessages(id);
  const topics = await topicService.getTopics({ sessionId: id });

  const config = createConfigFile('singleSession', { messages, sessions: [session], topics });

  exportConfigFile(config, `${session.meta?.title}-session`);
};

// =============   导出设置会话   ============= //
export const exportSettings = () => {
  const settings = getSettings();

  const config = createConfigFile('settings', { settings });

  exportConfigFile(config, 'settings');
};

export const exportAll = async () => {
  const sessions = await sessionService.getSessions();
  const messages = await messageService.getAllMessages();
  const topics = await topicService.getAllTopics();
  const settings = getSettings();

  const config = createConfigFile('all', { messages, sessions, settings, topics });

  exportConfigFile(config, 'config');
};
