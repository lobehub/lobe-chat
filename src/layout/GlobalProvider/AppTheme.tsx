'use client';

import { ConfigProvider, NeutralColors, PrimaryColors, ThemeProvider } from '@lobehub/ui';
import { App } from 'antd';
import { ThemeAppearance, createStyles } from 'antd-style';
import 'antd/dist/reset.css';
import Image from 'next/image';
import { PropsWithChildren, ReactNode, memo, useEffect } from 'react';

import AntdStaticMethods from '@/components/AntdStaticMethods';
import {
  LOBE_THEME_APPEARANCE,
  LOBE_THEME_NEUTRAL_COLOR,
  LOBE_THEME_PRIMARY_COLOR,
} from '@/const/theme';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { GlobalStyle } from '@/styles';
import { setCookie } from '@/utils/cookie';

const useStyles = createStyles(({ css, token }) => ({
  bg: css`
    position: relative;

    overflow-y: hidden;
    overscroll-behavior: none;
    display: flex;
    flex-direction: column;
    align-items: center;

    height: 100%;
    max-height: 100dvh !important;

    background: ${token.colorBgLayout};
  `,
  // scrollbar-width and scrollbar-color are supported from Chrome 121
  // https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color
  scrollbar: css`
    scrollbar-color: ${token.colorFill} transparent;
    scrollbar-width: thin;
  `,

  // so this is a polyfill for older browsers
  scrollbarPolyfill: css`
    ::-webkit-scrollbar {
      width: 0.75em;
      height: 0.75em;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
    }

    :hover::-webkit-scrollbar-thumb {
      background-color: ${token.colorText};
      background-clip: content-box;
      border: 3px solid transparent;
    }

    ::-webkit-scrollbar-track {
      background-color: transparent;
    }
  `,
}));

const Container = memo<PropsWithChildren>(({ children }) => {
  const { styles, cx } = useStyles();

  return (
    <App className={cx(styles.bg, styles.scrollbar, styles.scrollbarPolyfill)}>{children}</App>
  );
});

export interface AppThemeProps {
  children?: ReactNode;
  defaultAppearance?: ThemeAppearance;
  defaultNeutralColor?: NeutralColors;
  defaultPrimaryColor?: PrimaryColors;
}

const AppTheme = memo<AppThemeProps>(
  ({ children, defaultAppearance, defaultPrimaryColor, defaultNeutralColor }) => {
    // console.debug('server:appearance', defaultAppearance);
    // console.debug('server:primaryColor', defaultPrimaryColor);
    // console.debug('server:neutralColor', defaultNeutralColor);
    const themeMode = useUserStore((s) => settingsSelectors.currentSettings(s).themeMode);

    const [primaryColor, neutralColor] = useUserStore((s) => [
      settingsSelectors.currentSettings(s).primaryColor,
      settingsSelectors.currentSettings(s).neutralColor,
    ]);

    useEffect(() => {
      setCookie(LOBE_THEME_PRIMARY_COLOR, primaryColor);
    }, [primaryColor]);

    useEffect(() => {
      setCookie(LOBE_THEME_NEUTRAL_COLOR, neutralColor);
    }, [neutralColor]);

    return (
      <ThemeProvider
        customTheme={{
          neutralColor: neutralColor ?? defaultNeutralColor,
          primaryColor: primaryColor ?? defaultPrimaryColor,
        }}
        defaultAppearance={defaultAppearance}
        onAppearanceChange={(appearance) => {
          setCookie(LOBE_THEME_APPEARANCE, appearance);
        }}
        themeMode={themeMode}
      >
        <GlobalStyle />
        <AntdStaticMethods />
        <ConfigProvider config={{ imgAs: Image, imgUnoptimized: true }}>
          <Container>{children}</Container>
        </ConfigProvider>
      </ThemeProvider>
    );
  },
);

export default AppTheme;
