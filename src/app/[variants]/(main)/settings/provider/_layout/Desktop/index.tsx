import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import ProviderMenu from '../../ProviderMenu';
import Container from './Container';

const Layout = ({
  children,
  onProviderSelect,
}: PropsWithChildren & {
  onProviderSelect: (providerKey: string) => void;
}) => {
  return (
    <Flexbox
      horizontal
      style={{
        maxHeight: '100vh',
      }}
      width={'100%'}
    >
      <ProviderMenu mobile={false} onProviderSelect={onProviderSelect} />
      <Container>{children}</Container>
    </Flexbox>
  );
};
export default Layout;
