
import {
  ConfigProvider,
  NeutralColors,
  PrimaryColors,
  ThemeProvider,
} from '@lobehub/ui';
import { ThemeAppearance } from 'antd-style';
import Image from 'next/image';
import React, { ReactNode, memo, useEffect } from 'react'; // Explicit React import

import {
  LOBE_THEME_APPEARANCE,
  LOBE_THEME_NEUTRAL_COLOR,
  LOBE_THEME_PRIMARY_COLOR,
} from '@/const/theme';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';
import GlobalStyle from '@/styles';
import setCookie from '@/utils/cookie';

interface AppThemeProps {
  children?: ReactNode;
  defaultAppearance?: ThemeAppearance;
  defaultNeutralColor?: NeutralColors;
  defaultPrimaryColor?: PrimaryColors;
}

const AppTheme = memo<AppThemeProps>(
  ({
    children,
    defaultAppearance,
    defaultPrimaryColor,
    defaultNeutralColor,
  }) => {
    const themeMode = useGlobalStore((s) =>
      settingsSelectors.currentSettings(s).themeMode
    );

    const [primaryColor, neutralColor] = useGlobalStore((s) => [
      settingsSelectors.currentSettings(s).primaryColor,
      settingsSelectors.currentSettings(s).neutralColor,
    ]);

    // Use a constant for image URL
    const imageUrl = 'https://your-new-image-url.com';

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
          image: { src: imageUrl, alt: 'Your alternative image' }, // Add image to theme
        }}
        defaultAppearance={defaultAppearance}
        onAppearanceChange={(appearance) => {
          setCookie(LOBE_THEME_APPEARANCE, appearance);
        }}
        themeMode={themeMode}
      >
        <GlobalStyle />
        {/* <ConfigProvider config={{ imgAs: Image }}>{children}</ConfigProvider> */}
        <Image src={imageUrl} alt="Your alternative image" width={640} height={480} />
      </ThemeProvider>
    );
  }
);

export default AppTheme;
