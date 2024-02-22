import { NeutralColors, PrimaryColors, ThemeProvider } from '@lobehub/ui';
import { GlobalStyle } from '@/styles';
import { setCookie } from '@/utils/cookie';
import Image from 'next/image';
import { memo, useEffect } from 'react';

import {
  LOBE_THEME_APPEARANCE,
  LOBE_THEME_NEUTRAL_COLOR,
  LOBE_THEME_PRIMARY_COLOR,
} from '@/const/theme';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';

interface AppThemeProps {
  children?: React.ReactNode;
  defaultAppearance?: string; // Assurez-vous que le type correspond à votre définition
  defaultNeutralColor?: NeutralColors;
  defaultPrimaryColor?: PrimaryColors;
}

const AppTheme = memo<AppThemeProps>(({
  children,
  defaultAppearance,
  defaultPrimaryColor,
  defaultNeutralColor,
}) => {
  const themeMode = useGlobalStore((s) => settingsSelectors.currentSettings(s).themeMode);

  const [primaryColor, neutralColor] = useGlobalStore((s) => [
    settingsSelectors.currentSettings(s).primaryColor,
    settingsSelectors.currentSettings(s).neutralColor,
  ]);

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
        image: { src: imageUrl, alt: 'Your alternative image' },
      }}
      defaultAppearance={defaultAppearance}
      onAppearanceChange={(appearance) => {
        setCookie(LOBE_THEME_APPEARANCE, appearance);
      }}
      themeMode={themeMode}
    >
      <GlobalStyle />
      <Image src={imageUrl} alt="https://cloudinary-marketing-res.cloudinary.com/images/w_1000,c_scale/v1679921049/Image_URL_header/Image_URL_header-png" width={640} height={480} />
    </ThemeProvider>
  );
});

export default AppTheme;
