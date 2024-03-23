import { produce } from 'immer';
import type { StateCreator } from 'zustand/vanilla';

import type { GlobalStore } from '@/store/global';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import type { GlobalPreference, GlobalPreferenceState, Guide } from './initialState';

const n = setNamespace('preference');

/**
 * 设置操作
 */
export interface PreferenceAction {
  toggleChatSideBar: (visible?: boolean) => void;
  toggleExpandSessionGroup: (id: string, expand: boolean) => void;
  toggleMobileTopic: (visible?: boolean) => void;
  toggleSystemRole: (visible?: boolean) => void;
  updateGuideState: (guide: Partial<Guide>) => void;
  updatePreference: (preference: Partial<GlobalPreference>, action?: string) => void;
}

export const createPreferenceSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  PreferenceAction
> = (set, get) => ({
  toggleChatSideBar: (newValue) => {
    const showChatSideBar =
      typeof newValue === 'boolean' ? newValue : !get().preference.showChatSideBar;

    get().updatePreference({ showChatSideBar }, n('toggleAgentPanel', newValue) as string);
  },
  toggleExpandSessionGroup: (id, expand) => {
    const { preference } = get();
    const nextExpandSessionGroup = produce(preference.expandSessionGroupKeys, (draft) => {
      if (expand) {
        if (draft.includes(id)) return;
        draft.push(id);
      } else {
        const index = draft.indexOf(id);
        if (index !== -1) draft.splice(index, 1);
      }
    });
    get().updatePreference({ expandSessionGroupKeys: nextExpandSessionGroup });
  },
  toggleMobileTopic: (newValue) => {
    const mobileShowTopic =
      typeof newValue === 'boolean' ? newValue : !get().preference.mobileShowTopic;

    get().updatePreference({ mobileShowTopic }, n('toggleMobileTopic', newValue) as string);
  },
  toggleSystemRole: (newValue) => {
    const showSystemRole =
      typeof newValue === 'boolean' ? newValue : !get().preference.mobileShowTopic;

    get().updatePreference({ showSystemRole }, n('toggleMobileTopic', newValue) as string);
  },
  updateGuideState: (guide) => {
    const { updatePreference } = get();
    const nextGuide = merge(get().preference.guide, guide);
    updatePreference({ guide: nextGuide });
  },
  updatePreference: (preference, action) => {
    set(
      produce((draft: GlobalPreferenceState) => {
        draft.preference = merge(draft.preference, preference);
      }),
      false,
      action,
    );
  },
});
