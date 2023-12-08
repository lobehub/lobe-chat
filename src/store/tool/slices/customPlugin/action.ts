import { notification } from 'antd';
import { t } from 'i18next';
import { merge } from 'lodash-es';
import { StateCreator } from 'zustand/vanilla';

import { pluginService } from '@/services/plugin';
import { pluginHelpers } from '@/store/tool/helpers';
import { LobeToolCustomPlugin, PluginInstallError } from '@/types/tool/plugin';
import { setNamespace } from '@/utils/storeDebug';

import { ToolStore } from '../../store';
import { pluginSelectors } from '../plugin/selectors';
import { defaultCustomPlugin } from './initialState';

const n = setNamespace('customPlugin');

/**
 * 代理行为接口
 */
export interface CustomPluginAction {
  installCustomPlugin: (value: LobeToolCustomPlugin) => Promise<void>;
  reinstallCustomPlugin: (id: string) => Promise<void>;
  uninstallCustomPlugin: (id: string) => Promise<void>;
  updateCustomPlugin: (id: string, value: LobeToolCustomPlugin) => Promise<void>;
  updateNewCustomPlugin: (value: Partial<LobeToolCustomPlugin>) => void;
}

export const createCustomPluginSlice: StateCreator<
  ToolStore,
  [['zustand/devtools', never]],
  [],
  CustomPluginAction
> = (set, get) => ({
  installCustomPlugin: async (value) => {
    await pluginService.createCustomPlugin(value);

    await get().refreshPlugins();
    set({ newCustomPlugin: defaultCustomPlugin }, false, n('saveToCustomPluginList'));
  },
  reinstallCustomPlugin: async (id) => {
    const plugin = pluginSelectors.getCustomPluginById(id)(get());
    if (!plugin) return;

    const { refreshPlugins, updateInstallLoadingState } = get();
    try {
      updateInstallLoadingState(id, true);
      const manifest = await pluginService.getPluginManifest(plugin.customParams?.manifestUrl);
      updateInstallLoadingState(id, false);

      await pluginService.updatePluginManifest(id, manifest);
      await refreshPlugins();
    } catch (error) {
      updateInstallLoadingState(id, false);

      console.error(error);
      const err = error as PluginInstallError;

      const meta = pluginSelectors.getPluginMetaById(id)(get());
      const name = pluginHelpers.getPluginTitle(meta);

      notification.error({
        description: t(`error.${err.message}`, { error: err.cause, ns: 'plugin' }),
        message: t('error.reinstallError', { name, ns: 'plugin' }),
      });
    }
  },
  uninstallCustomPlugin: async (id) => {
    await pluginService.uninstallPlugin(id);
    await get().refreshPlugins();
  },

  updateCustomPlugin: async (id, value) => {
    const { reinstallCustomPlugin } = get();
    // 1. 更新 list 项信息
    await pluginService.updatePlugin(id, value);

    // 2. 重新安装插件
    await reinstallCustomPlugin(id);
  },
  updateNewCustomPlugin: (newCustomPlugin) => {
    set(
      { newCustomPlugin: merge({}, get().newCustomPlugin, newCustomPlugin) },
      false,
      n('updateNewDevPlugin'),
    );
  },
});
