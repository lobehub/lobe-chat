import { DeepPartial } from 'utility-types';
import { z } from 'zod';

import { TopicDisplayMode } from '@/types/topic';
import { UserSettings } from '@/types/user/settings';

export interface LobeUser {
  avatar?: string;
  email?: string | null;
  firstName?: string | null;
  fullName?: string | null;
  id: string;
  latestName?: string | null;
  username?: string | null;
}

export const UserGuideSchema = z.object({
  /**
   * Move the settings button to the avatar dropdown
   */
  moveSettingsToAvatar: z.boolean().optional(),

  /**
   * Topic Guide
   */
  topic: z.boolean().optional(),

  /**
   * tell user that uploaded files can be found in knowledge base
   */
  uploadFileInKnowledgeBase: z.boolean().optional(),
});

export type UserGuide = z.infer<typeof UserGuideSchema>;

export interface UserPreference {
  guide?: UserGuide;
  hideSyncAlert?: boolean;
  telemetry: boolean | null;
  topicDisplayMode?: TopicDisplayMode;
  /**
   * whether to use cmd + enter to send message
   */
  useCmdEnterToSend?: boolean;
}

export interface UserInitializationState {
  avatar?: string;
  canEnablePWAGuide?: boolean;
  canEnableTrace?: boolean;
  hasConversation?: boolean;
  isOnboard?: boolean;
  preference: UserPreference;
  settings: DeepPartial<UserSettings>;
  userId?: string;
}
