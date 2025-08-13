import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import ProviderMenu from '../../ProviderMenu';
import Container from './Container';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <Flexbox horizontal width={'100%'}>
      <ProviderMenu />
      <Container>{children}</Container>
    </Flexbox>
  );
};
export default Layout;
