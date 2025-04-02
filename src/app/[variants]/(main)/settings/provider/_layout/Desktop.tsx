import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import NProgress from '@/components/NProgress';
import SettingContainer from '@/features/Setting/SettingContainer';

import ProviderMenu from '../ProviderMenu';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <NProgress />
      <Flexbox horizontal width={'100%'}>
        <ProviderMenu />
        <SettingContainer>{children}</SettingContainer>
      </Flexbox>
    </>
  );
};
export default Layout;
