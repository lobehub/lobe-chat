import { PropsWithChildren } from 'react';

import SafeSpacing from '@/components/SafeSpacing';
import { HEADER_HEIGHT } from '@/const/layoutTokens';
import Footer from '@/features/Setting/Footer';
import SettingContainer from '@/features/Setting/SettingContainer';

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
