import { PropsWithChildren } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';

import SessionSearchBar from '../../features/SessionSearchBar';
import SessionHeader from './SessionHeader';

const MobileLayout = ({ children }: PropsWithChildren) => {
  return (
    <MobileContentLayout header={<SessionHeader />} withNav>
      <div style={{ padding: '8px 16px' }}>
        <SessionSearchBar mobile />
      </div>
      {children}
    </MobileContentLayout>
  );
};

export default MobileLayout;
