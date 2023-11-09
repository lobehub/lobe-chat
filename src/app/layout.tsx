import { Viewport } from 'next';
import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';

import Analytics from '@/components/Analytics';
import { DEFAULT_LANG, LOBE_LOCALE_COOKIE } from '@/const/locale';
import {
  LOBE_THEME_APPEARANCE,
  LOBE_THEME_NEUTRAL_COLOR,
  LOBE_THEME_PRIMARY_COLOR,
} from '@/const/theme';
import Layout from '@/layout/GlobalLayout';

import StyleRegistry from './StyleRegistry';

const RootLayout = ({ children }: PropsWithChildren) => {
  // get default theme config to use with ssr
  const cookieStore = cookies();
  const appearance = cookieStore.get(LOBE_THEME_APPEARANCE);
  const neutralColor = cookieStore.get(LOBE_THEME_NEUTRAL_COLOR);
  const primaryColor = cookieStore.get(LOBE_THEME_PRIMARY_COLOR);
  const lang = cookieStore.get(LOBE_LOCALE_COOKIE);

  return (
    <html lang={lang?.value || DEFAULT_LANG} suppressHydrationWarning>
      <body>
        <StyleRegistry>
          <Layout
            defaultAppearance={appearance?.value}
            defaultLang={lang?.value}
            defaultNeutralColor={neutralColor?.value as any}
            defaultPrimaryColor={primaryColor?.value as any}
          >
            {children}
          </Layout>
        </StyleRegistry>
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;

export { default as metadata } from './metadata';

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  themeColor: [
    { color: '#f8f8f8', media: '(prefers-color-scheme: light)' },
    { color: '#000', media: '(prefers-color-scheme: dark)' },
  ],
  userScalable: false,
  viewportFit: 'cover',
  width: 'device-width',
};
