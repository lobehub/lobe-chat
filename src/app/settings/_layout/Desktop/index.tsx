import { PropsWithChildren } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';

import Header from './Header';
import SideBar from './SideBar';

const DesktopLayout = ({ children }: PropsWithChildren) => (
  <>
    <SideBar />
    <Flexbox flex={1} height={'100%'} style={{ position: 'relative' }}>
      <Header />
      <Flexbox align={'center'} flex={1} padding={24} style={{ overflow: 'scroll' }}>
        <SafeSpacing />
        <Center gap={16} width={'100%'}>
          {children}
        </Center>
      </Flexbox>
    </Flexbox>
  </>
);

export default DesktopLayout;
