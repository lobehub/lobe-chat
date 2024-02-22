import { NeutralColors, PrimaryColors, ThemeProvider } from '@lobehub/ui';
import { GlobalStyle } from '@/styles';
import { setCookie } from '@/utils/cookie';
import Image from 'next/image';
import { memo, useEffect, ReactNode } from 'react';

import {
  LOBE_THEME_APPEARANCE,
  LOBE_THEME_NEUTRAL_COLOR,
  LOBE_THEME_PRIMARY_COLOR,
} from '@/const/theme';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';

// Définition des props pour GlobalLayoutProps avec des types plus précis
interface GlobalLayoutProps {
  defaultAppearance?: string; // Peut-être remplacé par un enum ou un type spécifique si vous avez un ensemble défini de thèmes d'apparence
  defaultLang?: string;
  defaultNeutralColor?: NeutralColors; // Utilisez le type spécifique au lieu de 'any'
  defaultPrimaryColor?: PrimaryColors; // Utilisez le type spécifique au lieu de 'any'
  enableOAuthSSO?: boolean;
  children?: ReactNode;
}

// Composant Layout
const Layout: React.FC<GlobalLayoutProps> = ({
  children,
  defaultAppearance,
  defaultLang,
  defaultNeutralColor,
  defaultPrimaryColor,
  enableOAuthSSO,
}) => {
  return (
    <div>
      {/* Structure de votre layout ici */}
      {children} {/* S'assurer que les enfants sont bien rendus */}
    </div>
  );
};

// Props pour AppTheme
interface AppThemeProps {
  children?: ReactNode;
  defaultAppearance?: string;
  defaultNeutralColor?: NeutralColors;
  defaultPrimaryColor?: PrimaryColors;
}

// Composant AppTheme
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

  const imageUrl = 'https://cloudinary-marketing-res.cloudinary.com/images/w_1000,c_scale/v1679921049/Image_URL_header/Image_URL_header-png';

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
      <Image src={imageUrl} alt="Your alternative image" width={640} height={480} />
    </ThemeProvider>
  );
});

export default AppTheme;
