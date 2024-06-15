import { PropsWithChildren } from 'react';

import Footer from '@/app/(main)/settings/features/Footer';
import SettingContainer from '@/app/(main)/settings/features/SettingContainer';
import SafeSpacing from '@/components/SafeSpacing';
import { HEADER_HEIGHT } from '@/const/layoutTokens';

import Header from './Header';

const Layout = ({ children }: PropsWithChildren) => (
  <>
    <Header />
    <SettingContainer addonAfter={<Footer />} addonBefore={<SafeSpacing height={HEADER_HEIGHT} />}>
      {children}
    </SettingContainer>
  </>
);

Layout.displayName = 'DesktopSessionSettingsLayout';

export default Layout;
