import type { DesktopNotificationSender } from '@lobechat/electron-client-ipc';
import type { ConversationContext } from '@lobechat/types';

import type { ChatStore } from '@/store/chat/store';

export interface DesktopNotificationContext {
  agentId?: ConversationContext['agentId'];
  groupId?: ConversationContext['groupId'];
  topicId?: ConversationContext['topicId'];
  workspaceSlug?: ConversationContext['workspaceSlug'];
}

export interface AgentCompletedNotificationOptions {
  badge?: boolean;
  content?: string;
  context: DesktopNotificationContext;
}

export const resolveNotificationNavigatePath = (
  _context: DesktopNotificationContext,
): string | undefined => undefined;

export const resolveNotificationNavigate = (
  _context: DesktopNotificationContext,
): { escape: boolean; path: string } | undefined => undefined;

export const resolveNotificationTitle = (
  _get: () => ChatStore,
  _context: DesktopNotificationContext,
  fallbackTitle: string,
): string => fallbackTitle;

export const buildNotificationSender = async (
  _context: DesktopNotificationContext,
): Promise<DesktopNotificationSender | undefined> => undefined;

export const buildNotificationBody = (_content: string | undefined, fallbackBody: string): string =>
  fallbackBody;

export const notifyDesktopHumanApprovalRequired = async (
  _get: () => ChatStore,
  _context: DesktopNotificationContext,
): Promise<void> => {};

export const notifyDesktopAgentCompleted = async (
  _get: () => ChatStore,
  _options: AgentCompletedNotificationOptions,
): Promise<void> => {};
