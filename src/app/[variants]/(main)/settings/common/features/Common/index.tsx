// components/Common/index.tsx (修复后)

'use client';

import { Skeleton } from 'antd';
// import isEqual from 'fast-deep-equal'; // 在这个文件中不再需要
import { memo, useState } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import CommonSettingsForm from './Common';

const Common = memo(() => {
    const isUserStateInit = useUserStore((s) => s.isUserStateInit);
    const isStatusInit = useGlobalStore((s) => s.isStatusInit);

    // 关键改动：对于 useServerConfigStore，我们必须作为 Hook 调用
    // 因为 serverConfig 通常是静态的，这不会导致不必要的重渲染
    const showAccessCodeConfig = useServerConfigStore(serverConfigSelectors.enabledAccessCode);

    const [initialState] = useState(() => ({
        // 其余 store 保持原来的优化方式
        general: settingsSelectors.currentSettings(useUserStore.getState()).general,
        language: systemStatusSelectors.language(useGlobalStore.getState()),
        themeMode: systemStatusSelectors.themeMode(useGlobalStore.getState()),
        // 注意：我们已将 showAccessCodeConfig 从这里移出，改为上面的 hook 调用
    }));

    const { setSettings } = useUserStore.getState();
    const { switchThemeMode, switchLocale } = useGlobalStore.getState();

    const handleValuesChange = async (v: any) => {
        await setSettings({ general: v });
    };

    if (!(isStatusInit && isUserStateInit)) {
        return <Skeleton active paragraph={{ rows: 5 }} title={false} />;
    }

    return (
        <CommonSettingsForm
            // @ts-ignore
            initialValues={initialState.general}
            language={initialState.language}
            // @ts-ignore
            onLocaleChange={switchLocale}
            onThemeModeChange={switchThemeMode}
            onValuesChange={handleValuesChange}
            // 将通过 hook 获取的值传递下去
            showAccessCodeConfig={showAccessCodeConfig}
            themeMode={initialState.themeMode}
        />
    );
});

export default Common;