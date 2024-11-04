import { DEFAULT_PREFERENCE } from '@/const/user';
import { UserStore } from '@/store/user';

const useCmdEnterToSend = (s: UserStore): boolean => s.preference.useCmdEnterToSend || false;
const topicDisplayMode = (s: UserStore) =>
  s.preference.topicDisplayMode || DEFAULT_PREFERENCE.topicDisplayMode;

const userAllowTrace = (s: UserStore) => s.preference.telemetry;

const hideSyncAlert = (s: UserStore) => s.preference.hideSyncAlert;

const hideSettingsMoveGuide = (s: UserStore) => s.preference.guide?.moveSettingsToAvatar;

const showUploadFileInKnowledgeBaseTip = (s: UserStore) =>
  s.preference.guide?.uploadFileInKnowledgeBase;

const shouldTriggerFileInKnowledgeBaseTip = (s: UserStore) =>
  !(typeof s.preference.guide?.moveSettingsToAvatar === 'boolean');

const isPreferenceInit = (s: UserStore) => s.isUserStateInit;

export const preferenceSelectors = {
  hideSettingsMoveGuide,
  hideSyncAlert,
  isPreferenceInit,
  shouldTriggerFileInKnowledgeBaseTip,
  showUploadFileInKnowledgeBaseTip,
  topicDisplayMode,
  useCmdEnterToSend,
  userAllowTrace,
};
