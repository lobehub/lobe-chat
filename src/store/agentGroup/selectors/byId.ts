import type { AgentGroupDetail, AgentItem } from '@lobechat/types';

import { DEFAULT_CHAT_GROUP_CHAT_CONFIG, DEFAULT_CHAT_GROUP_META_CONFIG } from '@/const/settings';
import { merge } from '@/utils/merge';

import { ChatGroupState, ChatGroupStore } from '../initialState';

const groupById =
  (id: string) =>
  (s: ChatGroupState): AgentGroupDetail | undefined =>
    s.groupMap[id];

const groupConfig = (groupId: string) => (s: ChatGroupStore) => {
  const group = groupById(groupId)(s);
  return merge(DEFAULT_CHAT_GROUP_CHAT_CONFIG, group?.config || {});
};

const groupMeta = (groupId: string) => (s: ChatGroupStore) => {
  const group = groupById(groupId)(s);
  return merge(DEFAULT_CHAT_GROUP_META_CONFIG, {
    description: group?.description || '',
    title: group?.title || '',
  });
};

const groupAgents =
  (groupId: string) =>
  (s: ChatGroupStore): AgentItem[] => {
    const group = groupById(groupId)(s);
    return group?.agents || [];
  };

const groupAgentCount =
  (groupId: string) =>
  (s: ChatGroupStore): number =>
    groupAgents(groupId)(s).length;

const agentByIdFromGroup =
  (groupId: string, agentId: string) =>
  (s: ChatGroupStore): AgentItem | undefined => {
    const agents = groupAgents(groupId)(s);
    return agents.find((agent) => agent.id === agentId);
  };

export const agentGroupByIdSelectors = {
  agentByIdFromGroup,
  groupAgentCount,
  groupAgents,
  groupById,
  groupConfig,
  groupMeta,
};
