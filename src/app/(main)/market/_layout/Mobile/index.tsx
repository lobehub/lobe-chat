import { PropsWithChildren } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';

import AgentSearchBar from '../../features/AgentSearchBar';
import Header from './Header';

const MobileLayout = ({ children }: PropsWithChildren) => {
  return (
    <MobileContentLayout gap={16} header={<Header />} style={{ paddingInline: 16 }} withNav>
      <AgentSearchBar mobile />
      {children}
    </MobileContentLayout>
  );
};

export default MobileLayout;
