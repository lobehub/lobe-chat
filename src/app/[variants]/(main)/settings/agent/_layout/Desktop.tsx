import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import NProgress from '@/components/NProgress';
import SettingContainer from '@/features/Setting/SettingContainer';

import AgentMenu from '../AgentMenu';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <NProgress />
      <Flexbox height={'100%'} horizontal width={'100%'}>
        <AgentMenu />
        <SettingContainer>{children}</SettingContainer>
      </Flexbox>
    </>
  );
};
export default Layout;
