import { settingsSelectors, useGlobalStore } from '@/store/global';
import { sessionSelectors, useSessionStore } from '@/store/session';
import { createConfigFile, exportConfigFile } from '@/utils/config';

const getAgents = () => sessionSelectors.exportAgents(useSessionStore.getState());
const getAgent = (id: string) => sessionSelectors.getExportAgent(id)(useSessionStore.getState());

const getSessions = () => sessionSelectors.exportSessions(useSessionStore.getState());
const getSession = (id: string) => sessionSelectors.getSessionById(id)(useSessionStore.getState());

const getSettings = () => settingsSelectors.exportSettings(useGlobalStore.getState());

export const exportAgents = () => {
  const sessions = getAgents();

  const config = createConfigFile('agents', { sessions });

  exportConfigFile(config, 'agents');
};

export const exportSingleAgent = (id: string) => {
  const agent = getAgent(id);
  if (!agent) return;

  const config = createConfigFile('agents', { sessions: { [id]: agent } });

  exportConfigFile(config, agent.meta?.title || 'agent');
};

export const exportSessions = () => {
  const sessions = getSessions();
  const config = createConfigFile('sessions', { sessions });

  exportConfigFile(config, 'sessions');
};

export const exportSingleSession = (id: string) => {
  const session = getSession(id);
  if (!session) return;
  const sessions = { [id]: session };

  const config = createConfigFile('sessions', { sessions });

  exportConfigFile(config, `${session.meta?.title}-session`);
};

export const exportSettings = () => {
  const settings = getSettings();

  const config = createConfigFile('settings', { settings });

  exportConfigFile(config, 'settings');
};

export const exportAll = () => {
  const sessions = getSessions();
  const settings = getSettings();

  const config = createConfigFile('all', { sessions, settings });

  exportConfigFile(config, 'config');
};
