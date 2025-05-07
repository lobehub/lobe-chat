import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import NProgress from '@/components/NProgress';

import ProviderMenu from '../../ProviderMenu';
import Container from './Container';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <NProgress />
      <Flexbox horizontal width={'100%'}>
        <ProviderMenu />
        <Container>{children}</Container>
      </Flexbox>
    </>
  );
};
export default Layout;
