import { ThemeProvider, lobeCustomTheme } from '@lobehub/ui';
import { App, ConfigProvider } from 'antd';
import { useThemeMode } from 'antd-style';
import 'antd/dist/reset.css';
import Zh_CN from 'antd/locale/zh_CN';
import { PropsWithChildren, useCallback, useEffect } from 'react';
import { useSettings } from 'src/store/global';

import { useSessionStore } from '@/store/session';
import { GlobalStyle } from '@/styles';

import i18n from '../locales';
import { useStyles } from './style';

const Layout = ({ children }: PropsWithChildren) => {
  const { styles } = useStyles();

  useEffect(() => {
    // 用一种比较奇怪的方式import 了 18n
    i18n.finally(() => {});
  }, []);

  return (
    <ConfigProvider locale={Zh_CN}>
      <App className={styles.bg}>{children}</App>
    </ConfigProvider>
  );
};

export default ({ children }: PropsWithChildren) => {
  const themeMode = useSettings((s) => s.settings.themeMode);
  const [primaryColor, neutralColor] = useSettings((s) => [
    s.settings.primaryColor,
    s.settings.neutralColor,
  ]);

  const { browserPrefers } = useThemeMode();
  const isDarkMode = themeMode === 'auto' ? browserPrefers === 'dark' : themeMode === 'dark';

  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useSessionStore.persist.rehydrate();
    useSettings.persist.rehydrate();
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
};
