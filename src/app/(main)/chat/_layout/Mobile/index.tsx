import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

const MobileLayout = ({ children }: PropsWithChildren) => {
  return (
    <Flexbox height={'100%'} style={{ overflowX: 'hidden', overflowY: 'auto' }} width={'100%'}>
      {children}
    </Flexbox>
  );
};

export default MobileLayout;
