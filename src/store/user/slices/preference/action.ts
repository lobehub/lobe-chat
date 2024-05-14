import { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { DEFAULT_PREFERENCE } from '@/const/user';
import { useClientDataSWR } from '@/libs/swr';
import type { UserStore } from '@/store/user';
import { UserGuide, UserPreference } from '@/types/user';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

const n = setNamespace('preference');

export interface PreferenceAction {
  updateGuideState: (guide: Partial<UserGuide>) => void;
  updatePreference: (preference: Partial<UserPreference>, action?: any) => void;
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
    useClientDataSWR<UserPreference>(
      'initUserPreference',
      () => get().preferenceStorage.getFromLocalStorage(),
      {
        onSuccess: (preference) => {
          const isEmpty = Object.keys(preference).length === 0;

          set(
            { isPreferenceInit: true, preference: isEmpty ? DEFAULT_PREFERENCE : preference },
            false,
            n('initPreference'),
          );
        },
      },
    ),
});
