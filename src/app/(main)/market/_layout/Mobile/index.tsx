import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import AgentSearchBar from '../../features/AgentSearchBar';
import Header from './Header';

const MobileLayout = ({ children }: PropsWithChildren) => {
  return (
    <Flexbox height={'100%'} style={{ overflowX: 'hidden', overflowY: 'auto' }} width={'100%'}>
      <Header />
      <Flexbox flex={1} gap={16} style={{ padding: 16 }}>
        <AgentSearchBar mobile />
        {children}
      </Flexbox>
    </Flexbox>
  );
};

export default MobileLayout;
