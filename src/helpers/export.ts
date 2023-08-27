import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { createConfigFile, exportConfigFile } from '@/utils/config';

const getSessions = () => sessionSelectors.exportSessions(useSessionStore.getState());
const getSession = (id: string) => sessionSelectors.getSessionById(id)(useSessionStore.getState());

const getSettings = () => settingsSelectors.exportSettings(useGlobalStore.getState());

// =============   导出所有角色   ============= //

export const exportAgents = () => {
  const agents = sessionSelectors.exportAgents(useSessionStore.getState());

  const config = createConfigFile('agents', agents);

  exportConfigFile(config, 'agents');
};

// =============   导出单个角色   ============= //

const getAgent = (id: string) => sessionSelectors.getExportAgent(id)(useSessionStore.getState());

export const exportSingleAgent = (id: string) => {
  const agent = getAgent(id);
  if (!agent) return;

  const config = createConfigFile('agents', { sessions: { [id]: agent } });

  exportConfigFile(config, agent.meta?.title || 'agent');
};

// =============   导出所有会话   ============= //

export const exportSessions = () => {
  const config = createConfigFile('sessions', getSessions());

  exportConfigFile(config, 'sessions');
};

// =============   导出单个会话   ============= //
export const exportSingleSession = (id: string) => {
  const session = getSession(id);
  if (!session) return;
  const sessions = { [id]: session };

  const config = createConfigFile('singleSession', { sessions });

  exportConfigFile(config, `${session.meta?.title}-session`);
};

// =============   导出设置会话   ============= //
export const exportSettings = () => {
  const settings = getSettings();

  const config = createConfigFile('settings', { settings });

  exportConfigFile(config, 'settings');
};

export const exportAll = () => {
  const sessions = getSessions();
  const settings = getSettings();

  const config = createConfigFile('all', { ...sessions, settings });

  exportConfigFile(config, 'config');
};
