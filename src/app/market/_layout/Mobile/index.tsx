import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import AgentSearchBar from '../../features/AgentSearchBar';
import Header from './Header';

const MobileLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      <Flexbox flex={1} gap={16} style={{ padding: 16 }}>
        <AgentSearchBar mobile />
        {children}
      </Flexbox>
    </>
  );
};

export default MobileLayout;
