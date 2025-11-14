import type { PartialDeep } from 'type-fest';
import { z } from 'zod';

import { Plans } from '../subscription';
import { TopicDisplayMode } from '../topic';
import { UserSettings } from './settings';

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

export const UserLabSchema = z.object({
  /**
   * enable multi-agent group chat mode
   */
  enableGroupChat: z.boolean().optional(),
  /**
   * enable markdown rendering in chat input editor
   */
  enableInputMarkdown: z.boolean().optional(),
});

export type UserLab = z.infer<typeof UserLabSchema>;

export interface UserPreference {
  /**
   * disable markdown rendering in chat input editor
   * @deprecated Use lab.enableInputMarkdown instead
   */
  disableInputMarkdownRender?: boolean;
  guide?: UserGuide;
  hideSyncAlert?: boolean;
  /**
   * lab experimental features
   */
  lab?: UserLab;
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
  email?: string;
  firstName?: string;
  fullName?: string;
  hasConversation?: boolean;
  isOnboard?: boolean;
  lastName?: string;
  preference: UserPreference;
  settings: PartialDeep<UserSettings>;
  subscriptionPlan?: Plans;
  userId?: string;
  username?: string;
}

export const NextAuthAccountSchame = z.object({
  provider: z.string(),
  providerAccountId: z.string(),
});

export const UserPreferenceSchema = z
  .object({
    guide: UserGuideSchema.optional(),
    hideSyncAlert: z.boolean().optional(),
    lab: UserLabSchema.optional(),
    telemetry: z.boolean().nullable(),
    topicDisplayMode: z.nativeEnum(TopicDisplayMode).optional(),
    useCmdEnterToSend: z.boolean().optional(),
  })
  .partial();
