import { merge } from 'lodash-es';
import { StateCreator } from 'zustand/vanilla';

import { CustomPlugin } from '@/types/plugin';
import { setNamespace } from '@/utils/storeDebug';

import { PluginStore } from '../../store';
import { defaultCustomPlugin } from './initialState';
import { CustomPluginListDispatch, devPluginListReducer } from './reducers/customPluginList';

const t = setNamespace('customPlugin');

/**
 * 代理行为接口
 */
export interface CustomPluginAction {
  dispatchCustomPluginList: (payload: CustomPluginListDispatch) => void;
  saveToCustomPluginList: (value: CustomPlugin) => void;
  updateNewDevPlugin: (value: Partial<CustomPlugin>) => void;
}

export const createCustomPluginSlice: StateCreator<
  PluginStore,
  [['zustand/devtools', never]],
  [],
  CustomPluginAction
> = (set, get) => ({
  dispatchCustomPluginList: (payload) => {
    const { customPluginList } = get();

    const nextList = devPluginListReducer(customPluginList, payload);
    set({ customPluginList: nextList }, false, t('dispatchDevList', payload));
  },
  saveToCustomPluginList: (value) => {
    get().dispatchCustomPluginList({ plugin: value, type: 'addItem' });
    set({ newCustomPlugin: defaultCustomPlugin }, false, t('saveToDevList'));
  },

  updateNewDevPlugin: (newCustomPlugin) => {
    set(
      { newCustomPlugin: merge({}, get().newCustomPlugin, newCustomPlugin) },
      false,
      t('updateNewDevPlugin'),
    );
  },
});
