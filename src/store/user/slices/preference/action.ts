import { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import type { UserStore } from '@/store/user';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

import type { GlobalPreference, Guide } from './initialState';

const n = setNamespace('preference');

export interface PreferenceAction {
  updateGuideState: (guide: Partial<Guide>) => void;
  updatePreference: (preference: Partial<GlobalPreference>, action?: any) => void;
  useInitPreference: () => SWRResponse;
}

export const createPreferenceSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  PreferenceAction
> = (set, get) => ({
  updateGuideState: (guide) => {
    const { updatePreference } = get();
    const nextGuide = merge(get().preference.guide, guide);
    updatePreference({ guide: nextGuide });
  },
  updatePreference: (preference, action) => {
    const nextPreference = merge(get().preference, preference);

    set({ preference: nextPreference }, false, action || n('updatePreference'));

    get().preferenceStorage.saveToLocalStorage(nextPreference);
  },

  useInitPreference: () =>
    useClientDataSWR<GlobalPreference>(
      'preference',
      () => get().preferenceStorage.getFromLocalStorage(),
      {
        onSuccess: (preference) => {
          if (preference) {
            set({ preference }, false, n('initPreference'));
          }
        },
      },
    ),
});
