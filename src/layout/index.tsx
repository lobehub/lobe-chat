import { ThemeProvider, lobeCustomTheme } from '@lobehub/ui';
import { App, ConfigProvider } from 'antd';
import { useThemeMode } from 'antd-style';
import 'antd/dist/reset.css';
import Zh_CN from 'antd/locale/zh_CN';
import { changeLanguage } from 'i18next';
import { PropsWithChildren, memo, useCallback, useEffect } from 'react';

import { createI18nNext } from '@/locales/create';
import { useGlobalStore, useOnFinishHydrationGlobal } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { GlobalStyle } from '@/styles';

import { useStyles } from './style';

const i18n = createI18nNext();

const Layout = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();

  useOnFinishHydrationGlobal((state) => {
    i18n.then(() => {
      changeLanguage(state.settings.language);
    });
  });

  return (
    <ConfigProvider locale={Zh_CN}>
      <App className={styles.bg}>{children}</App>
    </ConfigProvider>
  );
});

export default memo(({ children }: PropsWithChildren) => {
  const themeMode = useGlobalStore((s) => s.settings.themeMode);
  const [primaryColor, neutralColor] = useGlobalStore((s) => [
    s.settings.primaryColor,
    s.settings.neutralColor,
  ]);

  const { browserPrefers } = useThemeMode();
  const isDarkMode = themeMode === 'auto' ? browserPrefers === 'dark' : themeMode === 'dark';

  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useSessionStore.persist.rehydrate();
    useGlobalStore.persist.rehydrate();
  }, []);

  const genCustomToken: any = useCallback(
    () => lobeCustomTheme({ isDarkMode, neutralColor, primaryColor }),
    [primaryColor, neutralColor, isDarkMode],
  );

  return (
    <ThemeProvider customToken={genCustomToken || {}} themeMode={themeMode}>
      <GlobalStyle />
      <Layout>{children}</Layout>
    </ThemeProvider>
  );
});
