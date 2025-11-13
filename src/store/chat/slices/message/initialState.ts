import { UIChatMessage } from '@lobechat/types';

import { ChatGroupAgentItem, ChatGroupItem } from '@/database/schemas/chatGroup';

import type { SupervisorTodoItem } from './supervisor';

export interface ChatMessageState {
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   */
  activeId: string;
  /**
   * Type of the currently active session ('agent' | 'group')
   * Derived from session.type, used for caching to avoid repeated lookups
   */
  activeSessionType?: 'agent' | 'group';
  /**
   * is the message is continuing generation (used for disable continue button)
   */
  continuingIds: string[];
  /**
   * Raw messages from database (flat structure)
   */
  dbMessagesMap: Record<string, UIChatMessage[]>;
  /**
   * Group agents maps by group ID
   */
  groupAgentMaps: Record<string, ChatGroupAgentItem[]>;
  /**
   * Group data maps by group ID
   */
  groupMaps: Record<string, ChatGroupItem>;
  /**
   * Groups initialization status
   */
  groupsInit: boolean;
  isCreatingMessage: boolean;
  /**
   * is the message is editing
   */
  messageEditingIds: string[];
  /**
   * is the message is creating or updating in the service
   */
  messageLoadingIds: string[];
  /**
   * whether messages have fetched
   */
  messagesInit: boolean;
  /**
   * Parsed messages for display (includes assistantGroup from conversation-flow)
   */
  messagesMap: Record<string, UIChatMessage[]>;
  /**
   * is the message is regenerating (used for disable regenerate button)
   */
  regeneratingIds: string[];
  /**
   * Supervisor decision debounce timers by group ID
   */
  supervisorDebounceTimers: Record<string, number>;
  /**
   * Supervisor decision abort controllers by group ID
   */
  supervisorDecisionAbortControllers: Record<string, AbortController>;
  /**
   * Supervisor decision loading states
   */
  supervisorDecisionLoading: string[];
  /**
   * Supervisor todo list map keyed by session/topic combination
   */
  supervisorTodos: Record<string, SupervisorTodoItem[]>;
  /**
   * is the message in raw text preview mode (no markdown rendering)
   */
  messageRawPreviewIds: string[];
}

export const initialMessageState: ChatMessageState = {
  activeId: 'inbox',
  activeSessionType: undefined,
  continuingIds: [],
  dbMessagesMap: {},
  groupAgentMaps: {},
  groupMaps: {},
  groupsInit: false,
  isCreatingMessage: false,
  messageEditingIds: [],
  messageLoadingIds: [],
  messagesInit: false,
  messagesMap: {},
  regeneratingIds: [],
  supervisorDebounceTimers: {},
  supervisorDecisionAbortControllers: {},
  supervisorDecisionLoading: [],
  supervisorTodos: {},
  messageRawPreviewIds: [],
};
