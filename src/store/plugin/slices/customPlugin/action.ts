import { merge } from 'lodash-es';
import { StateCreator } from 'zustand/vanilla';

import { CustomPlugin } from '@/types/plugin';
import { setNamespace } from '@/utils/storeDebug';

import { PluginStore } from '../../store';
import { defaultCustomPlugin } from './initialState';
import { CustomPluginListDispatch, devPluginListReducer } from './reducers/customPluginList';

const n = setNamespace('customPlugin');

/**
 * 代理行为接口
 */
export interface CustomPluginAction {
  deleteCustomPlugin: (id: string) => void;
  dispatchCustomPluginList: (payload: CustomPluginListDispatch) => void;
  saveToCustomPluginList: (value: CustomPlugin) => void;
  updateCustomPlugin: (id: string, value: CustomPlugin) => void;
  updateNewCustomPlugin: (value: Partial<CustomPlugin>) => void;
}

export const createCustomPluginSlice: StateCreator<
  PluginStore,
  [['zustand/devtools', never]],
  [],
  CustomPluginAction
> = (set, get) => ({
  deleteCustomPlugin: (id) => {
    const { dispatchCustomPluginList, dispatchPluginManifest, deletePluginSettings } = get();
    // 1.删除插件项
    dispatchCustomPluginList({ id, type: 'deleteItem' });
    // 2.删除本地 manifest 记录
    dispatchPluginManifest({ id, type: 'deleteManifest' });
    // 3.删除插件配置
    deletePluginSettings(id);
  },
  dispatchCustomPluginList: (payload) => {
    const { customPluginList } = get();

    const nextList = devPluginListReducer(customPluginList, payload);
    set({ customPluginList: nextList }, false, n('dispatchCustomPluginList', payload));
  },
  saveToCustomPluginList: (value) => {
    get().dispatchCustomPluginList({ plugin: value, type: 'addItem' });
    set({ newCustomPlugin: defaultCustomPlugin }, false, n('saveToCustomPluginList'));
  },
  updateCustomPlugin: (id, value) => {
    const { dispatchCustomPluginList, installPlugin } = get();
    // 1. 更新 list 项信息
    dispatchCustomPluginList({ id, plugin: value, type: 'updateItem' });
    // 2. 重新安装插件
    installPlugin(id);
  },

  updateNewCustomPlugin: (newCustomPlugin) => {
    set(
      { newCustomPlugin: merge({}, get().newCustomPlugin, newCustomPlugin) },
      false,
      n('updateNewDevPlugin'),
    );
  },
});
