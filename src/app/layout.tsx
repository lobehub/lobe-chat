import { Analytics } from '@vercel/analytics/react';
import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';

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

  return (
    <html lang="en">
      <body>
        <StyleRegistry>
          <Layout
            defaultAppearance={appearance?.value}
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
