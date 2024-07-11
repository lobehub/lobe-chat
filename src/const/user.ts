import { UserPreference } from '@/types/user';

export const DEFAULT_PREFERENCE: UserPreference = {
  guide: {
    moveSettingsToAvatar: true,
    publicTest: true,
    topic: true,
  },
  telemetry: null,
  useCmdEnterToSend: false,
};
