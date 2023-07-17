import { ThemeProvider } from '@lobehub/ui';
import { App, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import Zh_CN from 'antd/locale/zh_CN';
import { PropsWithChildren, useEffect } from 'react';

import { useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';
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
  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useSessionStore.persist.rehydrate();
    useSettings.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider themeMode={'auto'}>
      <GlobalStyle />
      <Layout>{children}</Layout>
    </ThemeProvider>
  );
};
