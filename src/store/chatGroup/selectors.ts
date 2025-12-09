import { DEFAULT_CHAT_GROUP_CHAT_CONFIG, DEFAULT_CHAT_GROUP_META_CONFIG } from '@/const/settings';
import { ChatGroupItem } from '@/database/schemas/chatGroup';
import { ChatStoreState } from '@/store/chat/initialState';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { merge } from '@/utils/merge';

import { ChatGroupState, ChatGroupStore } from './initialState';

const getGroupById =
  (id: string) =>
  (s: ChatGroupState): ChatGroupItem | undefined =>
    s.groupMap[id];

const getAllGroups = (s: ChatGroupState): ChatGroupItem[] => Object.values(s.groupMap);

const isGroupsLoading = (s: ChatGroupState): boolean => s.isGroupsLoading;

const isGroupsInitialized = (s: ChatGroupState): boolean => s.groupsInit;

const activeGroupId = (): string | undefined => {
  const sessionStore = useSessionStore.getState();
  const session = sessionSelectors.currentSession(sessionStore);

  return session?.type === 'group' ? session.id : undefined;
};

const currentGroup = (s: ChatGroupStore): ChatGroupItem | undefined => {
  const groupId = activeGroupId();
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

const currentGroupConfig = (s: ChatGroupStore) => {
  const groupId = activeGroupId();
  return groupId ? getGroupConfig(groupId)(s) : DEFAULT_CHAT_GROUP_CHAT_CONFIG;
};

const currentGroupMeta = (s: ChatGroupStore) => {
  const groupId = activeGroupId();
  if (!groupId) return DEFAULT_CHAT_GROUP_META_CONFIG;

  const group = s.groupMap?.[groupId];
  return merge(DEFAULT_CHAT_GROUP_META_CONFIG, {
    description: group?.description || '',
    title: group?.title || '',
  });
};

export const chatGroupSelectors = {
  activeGroupId,
  allGroups,
  currentGroup,
  currentGroupConfig,
  currentGroupMeta,
  getAllGroups,
  getGroupById,
  getGroupByIdFromChatStore,
  getGroupConfig,
  groupsInitialized,
  isGroupsInitialized,
  isGroupsLoading,
};
