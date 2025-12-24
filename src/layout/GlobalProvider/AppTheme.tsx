'use client';

import {
  ConfigProvider,
  FontLoader,
  NeutralColors,
  PrimaryColors,
  ThemeProvider,
} from '@lobehub/ui';
import { message as antdMessage } from 'antd';
import { ThemeAppearance, createStyles } from 'antd-style';
import 'antd/dist/reset.css';
import { AppConfigContext } from 'antd/es/app/context';
import * as m from 'motion/react-m';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, memo, useEffect, useMemo } from 'react';

import AntdStaticMethods from '@/components/AntdStaticMethods';
import {
  LOBE_THEME_APPEARANCE,
  LOBE_THEME_NEUTRAL_COLOR,
  LOBE_THEME_PRIMARY_COLOR,
} from '@/const/theme';
import { isDesktop } from '@/const/version';
import { TITLE_BAR_HEIGHT } from '@/features/ElectronTitlebar';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';
import { GlobalStyle } from '@/styles';
import { setCookie } from '@/utils/client/cookie';

const useStyles = createStyles(({ css, token }) => ({
  app: css`
    position: relative;

    overscroll-behavior: none;
    display: flex;
    flex-direction: column;
    align-items: center;

    height: 100%;
    min-height: 100dvh;
    max-height: 100dvh;

    @media (min-device-width: 576px) {
      overflow: hidden;
    }
  `,
  // scrollbar-width and scrollbar-color are supported from Chrome 121
  // https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color
  scrollbar: css`
    scrollbar-color: ${token.colorFill} transparent;
    scrollbar-width: thin;

    #lobe-mobile-scroll-container {
      scrollbar-width: none;

      ::-webkit-scrollbar {
        width: 0;
        height: 0;
      }
    }
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
      border: 3px solid transparent;
      background-color: ${token.colorText};
      background-clip: content-box;
    }

    ::-webkit-scrollbar-track {
      background-color: transparent;
    }
  `,
}));

export interface AppThemeProps {
  children?: ReactNode;
  customFontFamily?: string;
  customFontURL?: string;
  defaultAppearance?: ThemeAppearance;
  defaultNeutralColor?: NeutralColors;
  defaultPrimaryColor?: PrimaryColors;
  globalCDN?: boolean;
}

const AppTheme = memo<AppThemeProps>(
  ({
    children,
    defaultAppearance,
    defaultPrimaryColor,
    defaultNeutralColor,
    globalCDN,
    customFontURL,
    customFontFamily,
  }) => {
    const themeMode = useGlobalStore(systemStatusSelectors.themeMode);
    const { styles, cx, theme } = useStyles();
    const [primaryColor, neutralColor, animationMode] = useUserStore((s) => [
      userGeneralSettingsSelectors.primaryColor(s),
      userGeneralSettingsSelectors.neutralColor(s),
      userGeneralSettingsSelectors.animationMode(s),
    ]);
    const messageTop = isDesktop ? TITLE_BAR_HEIGHT + 8 : undefined;
    const appConfig = useMemo(
      () => (messageTop === undefined ? {} : { message: { top: messageTop } }),
      [messageTop],
    );

    useEffect(() => {
      setCookie(LOBE_THEME_PRIMARY_COLOR, primaryColor);
    }, [primaryColor]);

    useEffect(() => {
      setCookie(LOBE_THEME_NEUTRAL_COLOR, neutralColor);
    }, [neutralColor]);

    useEffect(() => {
      if (messageTop === undefined) return;
      antdMessage.config({ top: messageTop });
    }, [messageTop]);

    return (
      <AppConfigContext.Provider value={appConfig}>
        <ThemeProvider
          motion={m as any}
          appearance={themeMode !== 'auto' ? themeMode : undefined}
          className={cx(styles.app, styles.scrollbar, styles.scrollbarPolyfill)}
          customTheme={{
            neutralColor: neutralColor ?? defaultNeutralColor,
            primaryColor: primaryColor ?? defaultPrimaryColor,
          }}
          defaultAppearance={defaultAppearance}
          onAppearanceChange={(appearance) => {
            if (themeMode !== 'auto') return;

            setCookie(LOBE_THEME_APPEARANCE, appearance);
          }}
          theme={{
            token: {
              fontFamily: customFontFamily ? `${customFontFamily},${theme.fontFamily}` : undefined,
              motion: animationMode !== 'disabled',
              motionUnit: animationMode === 'agile' ? 0.05 : 0.1,
            },
          }}
          themeMode={themeMode}
        >
          {!!customFontURL && <FontLoader url={customFontURL} />}
          <GlobalStyle />
          <AntdStaticMethods />
          <ConfigProvider
            motion={m as any}
            config={{
              aAs: Link,
              imgAs: Image,
              imgUnoptimized: true,
              proxy: globalCDN ? 'unpkg' : undefined,
            }}
          >
            {children}
          </ConfigProvider>
        </ThemeProvider>
      </AppConfigContext.Provider>
    );
  },
);

export default AppTheme;
