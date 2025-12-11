import type { AgentGroupDetail, AgentItem } from '@lobechat/types';

import { DEFAULT_CHAT_GROUP_CHAT_CONFIG, DEFAULT_CHAT_GROUP_META_CONFIG } from '@/const/settings';

import { ChatGroupState, ChatGroupStore } from '../initialState';
import { agentGroupByIdSelectors } from './byId';

export { agentGroupByIdSelectors } from './byId';

// ============ current selectors (use agentGroupByIdSelectors) ============

const activeGroupId = (s: ChatGroupState): string | undefined => s.activeGroupId;

const currentGroup = (s: ChatGroupStore): AgentGroupDetail | undefined => {
  const groupId = activeGroupId(s);
  return groupId ? agentGroupByIdSelectors.groupById(groupId)(s) : undefined;
};

const currentGroupConfig = (s: ChatGroupStore) => {
  const groupId = activeGroupId(s);
  return groupId ? agentGroupByIdSelectors.groupConfig(groupId)(s) : DEFAULT_CHAT_GROUP_CHAT_CONFIG;
};

const currentGroupMeta = (s: ChatGroupStore) => {
  const groupId = activeGroupId(s);
  return groupId ? agentGroupByIdSelectors.groupMeta(groupId)(s) : DEFAULT_CHAT_GROUP_META_CONFIG;
};

const currentGroupAgents = (s: ChatGroupStore): AgentItem[] => {
  const groupId = activeGroupId(s);
  return groupId ? agentGroupByIdSelectors.groupAgents(groupId)(s) : [];
};

// ============ other selectors ============

const getAllGroups = (s: ChatGroupState): AgentGroupDetail[] => Object.values(s.groupMap);

/**
 * Check if the current active group is loading
 * Uses groupMap pattern instead of manual loading flag
 */
const isGroupsInit = (s: ChatGroupState): boolean =>
  !s.activeGroupId || !s.groupMap[s.activeGroupId];

const isGroupsInitialized = (s: ChatGroupState): boolean => s.groupsInit;

export const agentGroupSelectors = {
  activeGroupId,
  currentGroup,
  currentGroupAgents,
  currentGroupConfig,
  currentGroupMeta,
  getAgentByIdFromGroup: agentGroupByIdSelectors.agentByIdFromGroup,
  getAllGroups,
  getGroupAgentCount: agentGroupByIdSelectors.groupAgentCount,
  getGroupAgents: agentGroupByIdSelectors.groupAgents,
  getGroupById: agentGroupByIdSelectors.groupById,
  getGroupConfig: agentGroupByIdSelectors.groupConfig,
  getGroupMeta: agentGroupByIdSelectors.groupMeta,
  isGroupsInit,
  isGroupsInitialized,
};
