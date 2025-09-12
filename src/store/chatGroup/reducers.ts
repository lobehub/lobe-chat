import { produce } from 'immer';

import { ChatGroupItem } from '@/database/schemas/chatGroup';

import { ChatGroupState } from './initialState';

export type ChatGroupReducer = (state: ChatGroupState, payload: any) => ChatGroupState;

export const chatGroupReducers = {
  // Add a new group to the list
  addGroup: (state: ChatGroupState, { payload }: { payload: ChatGroupItem }) =>
    produce(state, (draft: ChatGroupState) => {
      draft.groups.push(payload);
      draft.groupMap[payload.id] = payload;
    }),

  // Delete a group from the list
  deleteGroup: (state: ChatGroupState, { payload: id }: { payload: string }) =>
    produce(state, (draft: ChatGroupState) => {
      draft.groups = draft.groups.filter((group: ChatGroupItem) => group.id !== id);
      delete draft.groupMap[id];
    }),

  // Load groups into the state
  loadGroups: (state: ChatGroupState, { payload }: { payload: ChatGroupItem[] }) =>
    produce(state, (draft: ChatGroupState) => {
      draft.groups = payload;
      // Rebuild groupMap to maintain consistency
      draft.groupMap = payload.reduce(
        (map: Record<string, ChatGroupItem>, group: ChatGroupItem) => {
          map[group.id] = group;
          return map;
        },
        {},
      );
      draft.isGroupsLoading = false;
    }),

  // Set the loading state for groups
  setGroupsLoading: (state: ChatGroupState, { payload }: { payload: boolean }) => {
    return { ...state, isGroupsLoading: payload };
  },

  // Update a group in the map
  updateGroup: (
    state: ChatGroupState,
    { payload }: { payload: { id: string; value: Partial<ChatGroupItem> } },
  ) =>
    produce(state, (draft: ChatGroupState) => {
      if (draft.groupMap[payload.id]) {
        Object.assign(draft.groupMap[payload.id], payload.value);
        // Also update in groups array to maintain consistency
        const groupIndex = draft.groups.findIndex(
          (group: ChatGroupItem) => group.id === payload.id,
        );
        if (groupIndex !== -1) {
          Object.assign(draft.groups[groupIndex], payload.value);
        }
      }
    }),
};

export type ChatGroupDispatchPayloads = {
  addGroup: ChatGroupItem;
  deleteGroup: string;
  loadGroups: ChatGroupItem[];
  setGroupsLoading: boolean;
  updateGroup: { id: string; value: Partial<ChatGroupItem> };
};
