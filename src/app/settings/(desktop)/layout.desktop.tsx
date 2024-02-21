'use client';

import { ReactNode, memo } from 'react'; // S'assure que React est importé si nécessaire
import { Center, Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import AppLayoutDesktop from '@/layout/AppLayout.desktop';
import { SettingsTabs, SidebarTabKey } from '@/store/global/initialState';

import SideBar from './features/SideBar';

export interface DesktopLayoutProps {
  activeTab: SettingsTabs;
  children: ReactNode;
}

// Comme activeTab n'est pas utilisé dans Header, nous simplifions les props
const Header = () => {
  return (
    <div>
      <h1>DASHDASH</h1> {/* Ajout du titre ici */}
      {/* Autres éléments du Header */}
    </div>
  );
};

const DesktopLayout = memo<DesktopLayoutProps>(({ children, activeTab }) => {
  return (
    <AppLayoutDesktop sidebarKey={SidebarTabKey.Setting}>
      <SideBar activeTab={activeTab} />
      <Flexbox flex={1} height={'100%'} style={{ position: 'relative' }}>
        <Header /> {/* activeTab retiré car non utilisé */}
        <Flexbox align={'center'} flex={1} padding={24} style={{ overflow: 'auto' }}>
          <SafeSpacing />
          <Center gap={16} width={'100%'}>
            {/* Suppression du titre en double ici, car il est déjà présent dans Header */}
            {children}
          </Center>
        </Flexbox>
      </Flexbox>
    </AppLayoutDesktop>
  );
});

export default DesktopLayout;
