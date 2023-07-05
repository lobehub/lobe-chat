import { ThemeProvider } from '@lobehub/ui';
import { App, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import Zh_CN from 'antd/locale/zh_CN';
import { PropsWithChildren, useEffect } from 'react';
import { useChatStore } from 'src/store/session';

import { GlobalStyle, useStyles } from './style';

const Layout = ({ children }: PropsWithChildren) => {
  const { styles } = useStyles();

  return (
    <ConfigProvider locale={Zh_CN}>
      <App className={styles.bg}>{children}</App>
    </ConfigProvider>
  );
};

export default ({ children }: PropsWithChildren) => {
  useEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useChatStore.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider themeMode={'auto'}>
      <GlobalStyle />
      <Layout>{children}</Layout>
    </ThemeProvider>
  );
};
