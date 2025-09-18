import { isServerMode, isUsePgliteDB } from '@/const/version';
import { DatabaseLoadingState } from '@/types/clientDB';

import { GlobalState, INITIAL_STATUS } from '../initialState';

export const systemStatus = (s: GlobalState) => s.status;

const sessionGroupKeys = (s: GlobalState): string[] =>
  s.status.expandSessionGroupKeys || INITIAL_STATUS.expandSessionGroupKeys;

const showSystemRole = (s: GlobalState) => s.status.showSystemRole;
const mobileShowTopic = (s: GlobalState) => s.status.mobileShowTopic;
const mobileShowPortal = (s: GlobalState) => s.status.mobileShowPortal;
const showChatSideBar = (s: GlobalState) => !s.status.zenMode && s.status.showChatSideBar;
const showSessionPanel = (s: GlobalState) => !s.status.zenMode && s.status.showSessionPanel;
const showFilePanel = (s: GlobalState) => s.status.showFilePanel;
const showImagePanel = (s: GlobalState) => s.status.showImagePanel;
const showImageTopicPanel = (s: GlobalState) => s.status.showImageTopicPanel;
const hidePWAInstaller = (s: GlobalState) => s.status.hidePWAInstaller;
const isShowCredit = (s: GlobalState) => s.status.isShowCredit;
const themeMode = (s: GlobalState) => s.status.themeMode || 'auto';
const language = (s: GlobalState) => s.status.language || 'auto';

const showChatHeader = (s: GlobalState) => !s.status.zenMode;
const inZenMode = (s: GlobalState) => s.status.zenMode;
const sessionWidth = (s: GlobalState) => s.status.sessionsWidth;
const portalWidth = (s: GlobalState) => s.status.portalWidth || 400;
const filePanelWidth = (s: GlobalState) => s.status.filePanelWidth;
const imagePanelWidth = (s: GlobalState) => s.status.imagePanelWidth;
const imageTopicPanelWidth = (s: GlobalState) => s.status.imageTopicPanelWidth;
const wideScreen = (s: GlobalState) => !s.status.noWideScreen;
const chatInputHeight = (s: GlobalState) => s.status.chatInputHeight || 64;
const expandInputActionbar = (s: GlobalState) => s.status.expandInputActionbar;
const isStatusInit = (s: GlobalState) => !!s.isStatusInit;
const isPgliteNotEnabled = (s: GlobalState) =>
  isUsePgliteDB && !isServerMode && isStatusInit(s) && !s.status.isEnablePglite;

/**
 * 当且仅当 client db 模式，且 pglite 未初始化完成时返回 true
 */
const isPgliteNotInited = (s: GlobalState) =>
  isUsePgliteDB &&
  isStatusInit(s) &&
  s.status.isEnablePglite &&
  s.initClientDBStage !== DatabaseLoadingState.Ready;

/**
 * 当且仅当 client db 模式，且 pglite 初始化完成时返回 true
 */
const isPgliteInited = (s: GlobalState): boolean =>
  (isStatusInit(s) &&
    s.status.isEnablePglite &&
    s.initClientDBStage === DatabaseLoadingState.Ready) ||
  false;

// 这个变量控制 clientdb 是否完成初始化，正常来说，只有 pgliteDB 模式下，才会存在变化，其他时候都是 true
const isDBInited = (s: GlobalState): boolean => (isUsePgliteDB ? isPgliteInited(s) : true);

const getAgentSystemRoleExpanded =
  (agentId: string) =>
  (s: GlobalState): boolean => {
    const map = s.status.systemRoleExpandedMap || {};
    return map[agentId] !== false; // 角色设定默认为展开状态
  };

export const systemStatusSelectors = {
  chatInputHeight,
  expandInputActionbar,
  filePanelWidth,
  getAgentSystemRoleExpanded,
  hidePWAInstaller,
  imagePanelWidth,
  imageTopicPanelWidth,
  inZenMode,
  isDBInited,
  isPgliteInited,
  isPgliteNotEnabled,
  isPgliteNotInited,
  isShowCredit,
  isStatusInit,
  language,
  mobileShowPortal,
  mobileShowTopic,
  portalWidth,
  sessionGroupKeys,
  sessionWidth,
  showChatHeader,
  showChatSideBar,
  showFilePanel,
  showImagePanel,
  showImageTopicPanel,
  showSessionPanel,
  showSystemRole,
  systemStatus,
  themeMode,
  wideScreen,
};
