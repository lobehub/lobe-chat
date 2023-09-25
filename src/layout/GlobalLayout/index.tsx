'use client';

import { App, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import Zh_CN from 'antd/locale/zh_CN';
import { changeLanguage } from 'i18next';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, memo, useEffect } from 'react';

import AppTheme, { AppThemeProps } from '@/components/AppTheme';
import { createI18nNext } from '@/locales/create';
import { useGlobalStore, useOnFinishHydrationGlobal } from '@/store/global';
import { usePluginStore } from '@/store/plugin';
import { useOnFinishHydrationSession, useSessionStore } from '@/store/session';

import { useStyles } from './style';

const i18n = createI18nNext();

const Layout = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();

  const router = useRouter();

  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useSessionStore.persist.rehydrate();
    useGlobalStore.persist.rehydrate();
    usePluginStore.persist.rehydrate();
  }, []);

  useOnFinishHydrationGlobal((state) => {
    i18n.then(() => {
      changeLanguage(state.settings.language);
    });
  });

  useOnFinishHydrationSession((s, store) => {
    usePluginStore.getState().checkLocalEnabledPlugins(s.sessions);

    // add router instance to store
    store.setState({ router });
  });

  return (
    <ConfigProvider locale={Zh_CN}>
      <App className={styles.bg}>{children}</App>
    </ConfigProvider>
  );
});

const ThemeWrapper = ({ children, ...theme }: AppThemeProps) => (
  <AppTheme {...theme}>
    <Layout>{children}</Layout>
  </AppTheme>
);

export default ThemeWrapper;
