import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '../../store';

export interface ShareAction {
  genShareUrl: () => Promise<string>;
}

export const chatShare: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ShareAction
> = () => ({
  genShareUrl: () => {
    return Promise.resolve('TODO');
  },
});
