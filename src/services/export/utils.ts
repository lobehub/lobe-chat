import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

export const getSession = (id: string) =>
  sessionSelectors.getSessionById(id)(useSessionStore.getState());

export const getAgent = (id: string) =>
  sessionSelectors.getSessionById(id)(useSessionStore.getState());

export const getSettings = () => settingsSelectors.exportSettings(useUserStore.getState());
