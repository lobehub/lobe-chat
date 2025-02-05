import { isServerMode, isUsePgliteDB } from '@/const/version';
import { GlobalStore } from '@/store/global';
import { DatabaseLoadingState } from '@/types/clientDB';

import { INITIAL_STATUS } from './initialState';

const systemStatus = (s: GlobalStore) => s.status;

const sessionGroupKeys = (s: GlobalStore): string[] =>
  s.status.expandSessionGroupKeys || INITIAL_STATUS.expandSessionGroupKeys;

const showSystemRole = (s: GlobalStore) => s.status.showSystemRole;
const mobileShowTopic = (s: GlobalStore) => s.status.mobileShowTopic;
const mobileShowPortal = (s: GlobalStore) => s.status.mobileShowPortal;
const showChatSideBar = (s: GlobalStore) => !s.status.zenMode && s.status.showChatSideBar;
const showSessionPanel = (s: GlobalStore) => !s.status.zenMode && s.status.showSessionPanel;
const showFilePanel = (s: GlobalStore) => s.status.showFilePanel;
const hidePWAInstaller = (s: GlobalStore) => s.status.hidePWAInstaller;

const showChatHeader = (s: GlobalStore) => !s.status.zenMode;
const inZenMode = (s: GlobalStore) => s.status.zenMode;
const sessionWidth = (s: GlobalStore) => s.status.sessionsWidth;
const portalWidth = (s: GlobalStore) => s.status.portalWidth || 400;
const filePanelWidth = (s: GlobalStore) => s.status.filePanelWidth;
const inputHeight = (s: GlobalStore) => s.status.inputHeight;
const threadInputHeight = (s: GlobalStore) => s.status.threadInputHeight;

const isPgliteNotEnabled = (s: GlobalStore) =>
  isUsePgliteDB && !isServerMode && s.isStatusInit && !s.status.isEnablePglite;

/**
 * 当且仅当 client db 模式，且 pglite 未初始化完成时返回 true
 */
const isPgliteNotInited = (s: GlobalStore) =>
  isUsePgliteDB &&
  s.isStatusInit &&
  s.status.isEnablePglite &&
  s.initClientDBStage !== DatabaseLoadingState.Ready;

/**
 * 当且仅当 client db 模式，且 pglite 初始化完成时返回 true
 */
const isPgliteInited = (s: GlobalStore): boolean =>
  (s.isStatusInit &&
    s.status.isEnablePglite &&
    s.initClientDBStage === DatabaseLoadingState.Ready) ||
  false;

// 这个变量控制 clientdb 是否完成初始化，正常来说，只有 pgliteDB 模式下，才会存在变化，其他时候都是 true
const isDBInited = (s: GlobalStore): boolean => (isUsePgliteDB ? isPgliteInited(s) : true);

export const systemStatusSelectors = {
  filePanelWidth,
  hidePWAInstaller,
  inZenMode,
  inputHeight,
  isDBInited,
  isPgliteInited,
  isPgliteNotEnabled,
  isPgliteNotInited,
  mobileShowPortal,
  mobileShowTopic,
  portalWidth,
  sessionGroupKeys,
  sessionWidth,
  showChatHeader,
  showChatSideBar,
  showFilePanel,
  showSessionPanel,
  showSystemRole,
  systemStatus,
  threadInputHeight,
};
