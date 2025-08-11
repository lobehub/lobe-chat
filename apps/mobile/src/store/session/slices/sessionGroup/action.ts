import { StateCreator } from 'zustand/vanilla';

// import { message } from '@/components/AntdStaticMethods'; // TODO: RN端暂未实现此功能 - Toast消息组件
import { sessionService } from '@/services/session';
import { SessionStore } from '@/store/session';
import { SessionGroupItem } from '@/types/session';

import { SessionGroupsDispatch, sessionGroupsReducer } from './reducer';

/* eslint-disable typescript-sort-keys/interface */
export interface SessionGroupAction {
  addSessionGroup: (name: string) => Promise<string>;
  clearSessionGroups: () => Promise<void>;
  removeSessionGroup: (id: string) => Promise<void>;
  updateSessionGroupName: (id: string, name: string) => Promise<void>;
  updateSessionGroupSort: (items: SessionGroupItem[]) => Promise<void>;
  internal_dispatchSessionGroups: (payload: SessionGroupsDispatch) => void;
}
/* eslint-enable */

export const createSessionGroupSlice: StateCreator<SessionStore, [], [], SessionGroupAction> = (
  set,
  get,
) => ({
  addSessionGroup: async (name) => {
    const id = await sessionService.createSessionGroup(name);

    await get().refreshSessions();

    return id;
  },

  clearSessionGroups: async () => {
    await sessionService.removeSessionGroups();
    await get().refreshSessions();
  },

  removeSessionGroup: async (id) => {
    await sessionService.removeSessionGroup(id);
    await get().refreshSessions();
  },

  updateSessionGroupName: async (id, name) => {
    await sessionService.updateSessionGroup(id, { name });
    await get().refreshSessions();
  },
  updateSessionGroupSort: async (items) => {
    const sortMap = items.map((item, index) => ({ id: item.id, sort: index }));

    get().internal_dispatchSessionGroups({ sortMap, type: 'updateSessionGroupOrder' });

    // TODO: RN端暂未实现此功能 - Loading和Success消息提示
    // message.loading({
    //   content: t('sessionGroup.sorting', { ns: 'chat' }),
    //   duration: 0,
    //   key: 'updateSessionGroupSort',
    // });

    await sessionService.updateSessionGroupOrder(sortMap);

    // TODO: RN端暂未实现此功能 - Success消息提示
    // message.destroy('updateSessionGroupSort');
    // message.success(t('sessionGroup.sortSuccess', { ns: 'chat' }));

    await get().refreshSessions();
  },

  /* eslint-disable sort-keys-fix/sort-keys-fix */
  internal_dispatchSessionGroups: (payload) => {
    const nextSessionGroups = sessionGroupsReducer(get().sessionGroups, payload);
    get().internal_processSessions(get().sessions, nextSessionGroups, 'updateSessionGroups');
  },
});
