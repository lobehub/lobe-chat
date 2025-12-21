import { Flexbox } from '@lobehub/ui';
import { PropsWithChildren } from 'react';

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
        maxHeight: '100%',
      }}
      width={'100%'}
    >
      <ProviderMenu mobile={false} onProviderSelect={onProviderSelect} />
      <Container>{children}</Container>
    </Flexbox>
  );
};
export default Layout;
