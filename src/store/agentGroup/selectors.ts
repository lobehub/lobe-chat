import type { AgentGroupDetail, AgentItem } from '@lobechat/types';

import { DEFAULT_CHAT_GROUP_CHAT_CONFIG, DEFAULT_CHAT_GROUP_META_CONFIG } from '@/const/settings';
import { ChatGroupItem } from '@/database/schemas/chatGroup';
import { ChatStoreState } from '@/store/chat/initialState';
import { merge } from '@/utils/merge';

import { ChatGroupState, ChatGroupStore } from './initialState';

const getGroupById =
  (id: string) =>
  (s: ChatGroupState): AgentGroupDetail | undefined =>
    s.groupMap[id];

const getAllGroups = (s: ChatGroupState): AgentGroupDetail[] => Object.values(s.groupMap);

const isGroupsLoading = (s: ChatGroupState): boolean => s.isGroupsLoading;

const isGroupsInitialized = (s: ChatGroupState): boolean => s.groupsInit;

/**
 * Get active group ID directly from agentGroup store state
 */
const activeGroupId = (s: ChatGroupState): string | undefined => s.activeGroupId;

/**
 * Get current active group
 */
const currentGroup = (s: ChatGroupStore): AgentGroupDetail | undefined => {
  const groupId = s.activeGroupId;
  return groupId && s.groupMap ? s.groupMap[groupId] : undefined;
};

const getGroupByIdFromChatStore =
  (groupId: string) =>
  (s: ChatStoreState): ChatGroupItem | undefined =>
    s.groupMaps?.[groupId];

const allGroups = (s: ChatStoreState): ChatGroupItem[] =>
  s.groupMaps ? Object.values(s.groupMaps) : [];

const groupsInitialized = (s: ChatStoreState): boolean => s.groupsInit;

const getGroupConfig = (groupId: string) => (s: ChatGroupStore) => {
  const groupConfig = s.groupMap?.[groupId]?.config;
  return merge(DEFAULT_CHAT_GROUP_CHAT_CONFIG, groupConfig || {});
};

/**
 * Get current group config using activeGroupId from store state
 */
const currentGroupConfig = (s: ChatGroupStore) => {
  const groupId = s.activeGroupId;
  return groupId ? getGroupConfig(groupId)(s) : DEFAULT_CHAT_GROUP_CHAT_CONFIG;
};

/**
 * Get current group meta using activeGroupId from store state
 */
const currentGroupMeta = (s: ChatGroupStore) => {
  const groupId = s.activeGroupId;
  if (!groupId) return DEFAULT_CHAT_GROUP_META_CONFIG;

  const group = s.groupMap?.[groupId];
  return merge(DEFAULT_CHAT_GROUP_META_CONFIG, {
    description: group?.description || '',
    title: group?.title || '',
  });
};

/**
 * Get agents of a specific group by group ID
 */
const getGroupAgents =
  (groupId: string) =>
  (s: ChatGroupStore): AgentItem[] =>
    s.groupMap?.[groupId]?.agents || [];

/**
 * Get a specific agent by ID from a specific group
 */
const getAgentByIdFromGroup =
  (groupId: string, agentId: string) =>
  (s: ChatGroupStore): AgentItem | undefined => {
    const agents = getGroupAgents(groupId)(s);
    return agents.find((agent) => agent.id === agentId);
  };

/**
 * Get agent count for a specific group
 */
const getGroupAgentCount =
  (groupId: string) =>
  (s: ChatGroupStore): number =>
    getGroupAgents(groupId)(s).length;

export const agentGroupSelectors = {
  activeGroupId,
  allGroups,
  currentGroup,
  currentGroupConfig,
  currentGroupMeta,
  getAgentByIdFromGroup,
  getAllGroups,
  getGroupAgentCount,
  getGroupAgents,
  getGroupById,
  getGroupByIdFromChatStore,
  getGroupConfig,
  groupsInitialized,
  isGroupsInitialized,
  isGroupsLoading,
};

// Keep backward compatibility alias
export const chatGroupSelectors = agentGroupSelectors;
