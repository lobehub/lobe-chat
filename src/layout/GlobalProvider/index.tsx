import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import { FC, ReactNode } from 'react';

import { getClientConfig } from '@/config/client';
import { LOBE_LOCALE_COOKIE } from '@/const/locale';
import {
  LOBE_THEME_APPEARANCE,
  LOBE_THEME_NEUTRAL_COLOR,
  LOBE_THEME_PRIMARY_COLOR,
} from '@/const/theme';
import { getAntdLocale } from '@/utils/locale';

import AppTheme from './AppTheme';
import Locale from './Locale';
import StoreHydration from './StoreHydration';
import StyleRegistry from './StyleRegistry';

let DebugUI: FC = () => null;

// we need use Constant Folding to remove code below in production
// refs: https://webpack.js.org/plugins/internal-plugins/#constplugin
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line unicorn/no-lonely-if
  if (getClientConfig().DEBUG_MODE) {
    DebugUI = dynamic(() => import('@/features/DebugUI'), { ssr: false }) as FC;
  }
}

interface GlobalLayoutProps {
  children: ReactNode;
}

const GlobalLayout = async ({ children }: GlobalLayoutProps) => {
  // get default theme config to use with ssr
  const cookieStore = cookies();
  const appearance = cookieStore.get(LOBE_THEME_APPEARANCE);
  const neutralColor = cookieStore.get(LOBE_THEME_NEUTRAL_COLOR);
  const primaryColor = cookieStore.get(LOBE_THEME_PRIMARY_COLOR);

  // get default locale config to use with ssr
  const defaultLang = cookieStore.get(LOBE_LOCALE_COOKIE);
  const antdLocale = await getAntdLocale(defaultLang?.value);

  return (
    <StyleRegistry>
      <Locale antdLocale={antdLocale} defaultLang={defaultLang?.value}>
        <AppTheme
          defaultAppearance={appearance?.value}
          defaultNeutralColor={neutralColor?.value as any}
          defaultPrimaryColor={primaryColor?.value as any}
        >
          <StoreHydration />
          {children}
          <DebugUI />
        </AppTheme>
      </Locale>
    </StyleRegistry>
  );
};

export default GlobalLayout;
