import { StateCreator } from 'zustand/vanilla';

import { sessionService } from '@/services/session';
import { SessionStore } from '@/store/session';
import { SessionGroupItem } from '@/types/session';

export interface SessionGroupAction {
  addSessionGroup: (name: string) => Promise<string>;
  clearSessionGroups: () => Promise<void>;
  removeSessionGroup: (id: string) => Promise<void>;
  updateSessionGroupId: (sessionId: string, groupId: string) => Promise<void>;
  updateSessionGroupName: (id: string, name: string) => Promise<void>;
  updateSessionGroupSort: (items: SessionGroupItem[]) => Promise<void>;
}

export const createSessionGroupSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  SessionGroupAction
> = (set, get) => ({
  addSessionGroup: async (name) => {
    const id = await sessionService.createSessionGroup(name);

    await get().refreshSessions();

    return id;
  },

  clearSessionGroups: async () => {
    await sessionService.clearSessionGroups();
    await get().refreshSessions();
  },

  removeSessionGroup: async (id) => {
    await sessionService.removeSessionGroup(id);
    await get().refreshSessions();
  },
  updateSessionGroupId: async (sessionId, groupId) => {
    await sessionService.updateSessionGroupId(sessionId, groupId);

    await get().refreshSessions();
  },

  updateSessionGroupName: async (id, name) => {
    await sessionService.updateSessionGroup(id, { name });
    await get().refreshSessions();
  },
  updateSessionGroupSort: async (items) => {
    const sortMap = items.map((item, index) => ({ id: item.id, sort: index }));
    await sessionService.updateSessionGroupOrder(sortMap);
    await get().refreshSessions();
  },
});
