import { TopicDisplayMode, UserPreference } from '@lobechat/types';

export const DEFAULT_PREFERENCE: UserPreference = {
  disableInputMarkdownRender: false,
  enableGroupChat: false,
  guide: {
    moveSettingsToAvatar: true,
    topic: true,
  },
  telemetry: null,
  topicDisplayMode: TopicDisplayMode.ByTime,
  useCmdEnterToSend: false,
};
