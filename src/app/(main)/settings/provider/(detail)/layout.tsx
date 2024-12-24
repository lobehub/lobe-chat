import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import { MAX_WIDTH } from '@/const/layoutTokens';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <Flexbox horizontal justify={'center'} paddingBlock={24} width={'100%'}>
      <Flexbox style={{ maxWidth: MAX_WIDTH, width: '100%' }}>{children}</Flexbox>
    </Flexbox>
  );
};
export default Layout;
