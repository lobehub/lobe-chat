import { StateCreator } from 'zustand/vanilla';

import { setNamespace } from '@/utils/storeDebug';

import { UserStore } from '../../store';

const n = setNamespace('auth');

export interface UserAuthAction {
  getUserConfig: () => void;
}

export const createAuthSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  UserAuthAction
> = () => ({
  getUserConfig: () => {
    console.log(n('userconfig'));
  },
});
