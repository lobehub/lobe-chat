import { GlobalStore } from '@/store/global';

import { INITIAL_STATUS } from './initialState';

const sessionGroupKeys = (s: GlobalStore): string[] =>
  s.status.expandSessionGroupKeys || INITIAL_STATUS.expandSessionGroupKeys;

const showSystemRole = (s: GlobalStore) => s.status.showSystemRole;
const mobileShowTopic = (s: GlobalStore) => s.status.mobileShowTopic;
const mobileShowPortal = (s: GlobalStore) => s.status.mobileShowPortal;
const showChatSideBar = (s: GlobalStore) => s.status.showChatSideBar;
const showSessionPanel = (s: GlobalStore) => s.status.showSessionPanel;
const showFilePanel = (s: GlobalStore) => s.status.showFilePanel;
const hidePWAInstaller = (s: GlobalStore) => s.status.hidePWAInstaller;

const sessionWidth = (s: GlobalStore) => s.status.sessionsWidth;
const filePanelWidth = (s: GlobalStore) => s.status.filePanelWidth;
const inputHeight = (s: GlobalStore) => s.status.inputHeight;

export const systemStatusSelectors = {
  filePanelWidth,
  hidePWAInstaller,
  inputHeight,
  mobileShowPortal,
  mobileShowTopic,
  sessionGroupKeys,
  sessionWidth,
  showChatSideBar,
  showFilePanel,
  showSessionPanel,
  showSystemRole,
};
