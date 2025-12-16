import { TopicDisplayMode, UserPreference } from '@lobechat/types';

export const DEFAULT_PREFERENCE: UserPreference = {
  guide: {
    moveSettingsToAvatar: true,
    topic: true,
  },
  lab: {
    enableInputMarkdown: true,
  },
  topicDisplayMode: TopicDisplayMode.ByTime,
  useCmdEnterToSend: false,
};
