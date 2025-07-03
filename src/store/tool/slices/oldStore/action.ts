import { t } from 'i18next';
import { produce } from 'immer';
import { uniqBy } from 'lodash-es';
import useSWR, { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { notification } from '@/components/AntdStaticMethods';
import { pluginService } from '@/services/plugin';
import { toolService } from '@/services/tool';
import { globalHelpers } from '@/store/global/helpers';
import { pluginStoreSelectors } from '@/store/tool/selectors';
import { DiscoverPluginItem, PluginListResponse, PluginQueryParams } from '@/types/discover';
import { LobeTool } from '@/types/tool';
import { PluginInstallError } from '@/types/tool/plugin';
import { setNamespace } from '@/utils/storeDebug';

import { ToolStore } from '../../store';
import { PluginStoreState } from './initialState';

const n = setNamespace('pluginStore');

const INSTALLED_PLUGINS = 'loadInstalledPlugins';

export interface PluginStoreAction {
  installPlugin: (identifier: string, source?: 'plugin' | 'customPlugin') => Promise<void>;
  installPlugins: (plugins: string[]) => Promise<void>;
  loadMorePlugins: () => void;
  loadPluginStore: () => Promise<DiscoverPluginItem[]>;
  refreshPlugins: () => Promise<void>;

  resetPluginList: (keywords?: string) => void;
  uninstallPlugin: (identifier: string) => Promise<void>;
  updateInstallLoadingState: (key: string, value: boolean | undefined) => void;

  useFetchInstalledPlugins: (enabled: boolean) => SWRResponse<LobeTool[]>;
  useFetchPluginList: (params: PluginQueryParams) => SWRResponse<PluginListResponse>;
  useFetchPluginStore: () => SWRResponse<DiscoverPluginItem[]>;
}

export const createPluginStoreSlice: StateCreator<
  ToolStore,
  [['zustand/devtools', never]],
  [],
  PluginStoreAction
> = (set, get) => ({
  installPlugin: async (name, type = 'plugin') => {
    const plugin = pluginStoreSelectors.getPluginById(name)(get());
    if (!plugin) return;

    const { updateInstallLoadingState, refreshPlugins } = get();
    try {
      updateInstallLoadingState(name, true);
      const data = await toolService.getToolManifest(plugin.manifest);

      // 4. 存储 manifest 信息
      await pluginService.installPlugin({ identifier: plugin.identifier, manifest: data, type });
      await refreshPlugins();

      updateInstallLoadingState(name, undefined);
    } catch (error) {
      console.error(error);
      updateInstallLoadingState(name, undefined);

      const err = error as PluginInstallError;

      notification.error({
        description: t(`error.${err.message}`, { ns: 'plugin' }),
        message: t('error.installError', { name: plugin.title, ns: 'plugin' }),
      });
    }
  },
  installPlugins: async (plugins) => {
    const { installPlugin } = get();

    await Promise.all(plugins.map((identifier) => installPlugin(identifier)));
  },
  loadMorePlugins: () => {
    const { oldPluginItems, pluginTotalCount, currentPluginPage } = get();

    // 检查是否还有更多数据可以加载
    if (oldPluginItems.length < (pluginTotalCount || 0)) {
      set(
        produce((draft: PluginStoreState) => {
          draft.currentPluginPage = currentPluginPage + 1;
        }),
        false,
        n('loadMorePlugins'),
      );
    }
  },
  loadPluginStore: async () => {
    const locale = globalHelpers.getCurrentLanguage();

    // 使用 edgeClient 调用 market API
    const { edgeClient } = await import('@/libs/trpc/client');
    const data = await edgeClient.market.getPluginList.query({
      locale,
      page: 1,
      pageSize: 50,
    });

    set({ oldPluginItems: data.items }, false, n('loadPluginList'));

    return data.items;
  },
  refreshPlugins: async () => {
    await mutate(INSTALLED_PLUGINS);
  },
  resetPluginList: (keywords) => {
    set(
      produce((draft: PluginStoreState) => {
        draft.oldPluginItems = [];
        draft.currentPluginPage = 1;
        draft.pluginSearchKeywords = keywords;
      }),
      false,
      n('resetPluginList'),
    );
  },
  uninstallPlugin: async (identifier) => {
    await pluginService.uninstallPlugin(identifier);
    await get().refreshPlugins();
  },
  updateInstallLoadingState: (key, value) => {
    set(
      produce((draft: PluginStoreState) => {
        draft.pluginInstallLoading[key] = value;
      }),
      false,
      n('updateInstallLoadingState'),
    );
  },

  useFetchInstalledPlugins: (enabled: boolean) =>
    useSWR<LobeTool[]>(enabled ? INSTALLED_PLUGINS : null, pluginService.getInstalledPlugins, {
      fallbackData: [],
      onSuccess: (data) => {
        set(
          { installedPlugins: data, loadingInstallPlugins: false },
          false,
          n('useFetchInstalledPlugins'),
        );
      },
      revalidateOnFocus: false,
      suspense: true,
    }),
  useFetchPluginList: (params) => {
    const locale = globalHelpers.getCurrentLanguage();

    return useSWR<PluginListResponse>(
      ['useFetchPluginList', locale, ...Object.values(params)].filter(Boolean).join('-'),
      async () => {
        // 使用 edgeClient 调用 market API
        const { edgeClient } = await import('@/libs/trpc/client');
        return edgeClient.market.getPluginList.query({
          ...params,
          locale,
          page: params.page ? Number(params.page) : 1,
          pageSize: params.pageSize ? Number(params.pageSize) : 20,
        });
      },
      {
        onSuccess(data) {
          set(
            produce((draft: PluginStoreState) => {
              draft.pluginSearchLoading = false;

              // 设置基础信息
              if (!draft.isPluginListInit) {
                draft.activePluginIdentifier = data.items?.[0]?.identifier;
                draft.isPluginListInit = true;
                draft.pluginTotalCount = data.totalCount;
              }

              // 累积数据逻辑
              if (params.page === 1) {
                // 第一页，直接设置
                draft.oldPluginItems = uniqBy(data.items, 'identifier');
              } else {
                // 后续页面，累积数据
                draft.oldPluginItems = uniqBy(
                  [...draft.oldPluginItems, ...data.items],
                  'identifier',
                );
              }
            }),
            false,
            n('useFetchPluginList/onSuccess'),
          );
        },
        revalidateOnFocus: false,
      },
    );
  },
  useFetchPluginStore: () =>
    useSWR<DiscoverPluginItem[]>('loadPluginStore', get().loadPluginStore, {
      fallbackData: [],
      revalidateOnFocus: false,
      suspense: true,
    }),
});
