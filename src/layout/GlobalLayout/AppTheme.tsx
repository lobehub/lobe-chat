import { ConfigProvider, NeutralColors, PrimaryColors, ThemeProvider } from '@lobehub/ui';
import { ThemeAppearance } from 'antd-style';
import Image from 'next/image';
import { ReactNode, memo, useEffect } from 'react';

import {
  LOBE_THEME_APPEARANCE,
  LOBE_THEME_NEUTRAL_COLOR,
  LOBE_THEME_PRIMARY_COLOR,
} from '@/const/theme';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';
import { GlobalStyle } from '@/styles';
import { setCookie } from '@/utils/cookie';

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
    const themeMode = useGlobalStore((s) => settingsSelectors.currentSettings(s).themeMode);

    const [primaryColor, neutralColor] = useGlobalStore((s) => [
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
        <ConfigProvider config={{ imgAs: Image } as any}>{children}</ConfigProvider>
      </ThemeProvider>
    );
  },
);

export default AppTheme;
