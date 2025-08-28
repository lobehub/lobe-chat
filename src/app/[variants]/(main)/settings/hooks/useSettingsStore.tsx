// src/app/[variants]/(main)/settings/hooks/useSettingsStore.ts
'use client';

import { useState } from 'react';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

/**
 * @description 设置页面的中央数据枢纽 Hook
 * @designed 该 Hook 旨在一次性从各个 store 中获取所有设置页面所需的数据和 actions,
 *           以解决在切换设置 Tab 时因动态加载 store 导致的性能问题。
 *           通过 State Hoisting 模式，将状态提升到 settings 的顶层 Layout,
 *           然后通过 props 将数据分发给各个子组件。
 */
export const useSettingsStore = () => {
    // 1. 响应式地监听全局加载状态，只有当所有 store 初始化完成后，才认为数据准备就绪
    const isUserStateInit = useUserStore((s) => s.isUserStateInit);
    const isStatusInit = useGlobalStore((s) => s.isStatusInit);
    const isLoaded = isStatusInit && isUserStateInit;

    // 2. 响应式地获取那些需要在UI上实时反馈的状态
    //    例如，serverConfig 属于必须用 hook 获取的
    const showAccessCodeConfig = useServerConfigStore(serverConfigSelectors.enabledAccessCode);
    const themeMode = useGlobalStore(systemStatusSelectors.themeMode);
    const language = useGlobalStore(systemStatusSelectors.language);

    // 3. 非响应式地获取初始化数据和 Action 函数
    //    `useState` 的函数初始化器确保这部分逻辑只在组件首次渲染时执行一次
    const [storeApi] = useState(() => {
        // 非响应式 ações，因为它们是稳定的
        const userStoreActions = useUserStore.getState();
        const globalStoreActions = useGlobalStore.getState();

        // 返回所有设置页面需要的 props 和 actions
        return {
            // common tab 所需的数据和 actions
            common: {
                initialValues: settingsSelectors.currentSettings(userStoreActions).general,
                onLocaleChange: globalStoreActions.switchLocale,
                onThemeModeChange: globalStoreActions.switchThemeMode,
                onValuesChange: async (v: any) => {
                    await userStoreActions.setSettings({ general: v });
                },
            },
            // 在此添加其他页面的数据和 actions...
            // 例如 llm: { ... }, agent: { ... }
        };
    });

    // 4. 组装并返回一个完整的 state 和 actions 对象
    return {
        actions: {
            ...storeApi,
            // 如果有全局共享的 action，也可以放在顶层
        },
        isLoaded,
        state: {
            // 合并响应式和非响应式的数据
            common: {
                language,
                showAccessCodeConfig,
                themeMode,
            },
            // 在此添加其他页面的 state ...
        },
    };
};