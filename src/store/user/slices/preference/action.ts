import { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { DEFAULT_PREFERENCE } from '@/const/user';
import { useClientDataSWR } from '@/libs/swr';
import { userService } from '@/services/user';
import type { UserStore } from '@/store/user';
import { UserGuide, UserPreference } from '@/types/user';
import { merge } from '@/utils/merge';
import { setNamespace } from '@/utils/storeDebug';

const n = setNamespace('preference');

export interface PreferenceAction {
  updateGuideState: (guide: Partial<UserGuide>) => Promise<void>;
  updatePreference: (preference: Partial<UserPreference>, action?: any) => Promise<void>;
  useInitPreference: () => SWRResponse;
}

export const createPreferenceSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  PreferenceAction
> = (set, get) => ({
  updateGuideState: async (guide) => {
    const { updatePreference } = get();
    const nextGuide = merge(get().preference.guide, guide);
    await updatePreference({ guide: nextGuide });
  },
  updatePreference: async (preference, action) => {
    const nextPreference = merge(get().preference, preference);

    set({ preference: nextPreference }, false, action || n('updatePreference'));

    await userService.updatePreference(nextPreference);
  },

  useInitPreference: () =>
    useClientDataSWR<UserPreference>('initUserPreference', userService.getPreference, {
      onSuccess: (preference) => {
        const isEmpty = Object.keys(preference).length === 0;

        set(
          { isPreferenceInit: true, preference: isEmpty ? DEFAULT_PREFERENCE : preference },
          false,
          n('initPreference'),
        );
      },
    }),
});
