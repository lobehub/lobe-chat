import { UserStore } from '@/store/user';
import { TopicDisplayMode } from '@/types/topic';

const useCmdEnterToSend = (s: UserStore): boolean => s.preference.useCmdEnterToSend || false;
const topicDisplayMode = (s: UserStore) => s.preference.topicDisplayMode || TopicDisplayMode.Flat;

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
