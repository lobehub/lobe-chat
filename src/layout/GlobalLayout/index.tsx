'use client';

import { App } from 'antd';
import { createStyles } from 'antd-style';
import 'antd/dist/reset.css';
import { PropsWithChildren, memo } from 'react';

import AppTheme, { AppThemeProps } from './AppTheme';
import Locale from './Locale';
import StoreHydration from './StoreHydration';

const useStyles = createStyles(({ css, token }) => ({
  bg: css`
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;

    height: 100%;

    background: ${token.colorBgLayout};
  `,
}));

const Container = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();

  return <App className={styles.bg}>{children}</App>;
});

interface GlobalLayoutProps extends AppThemeProps {
  defaultLang?: string;
}

const GlobalLayout = ({ children, defaultLang, ...theme }: GlobalLayoutProps) => (
  <AppTheme {...theme}>
    <Locale lang={defaultLang}>
      <StoreHydration />
      <Container>{children}</Container>
    </Locale>
  </AppTheme>
);

export default GlobalLayout;
