import { PropsWithChildren } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';

import SessionHeader from './SessionHeader';
import SessionSearchBar from './SessionSearchBar';

const MobileLayout = ({ children }: PropsWithChildren) => {
  return (
    <MobileContentLayout header={<SessionHeader />} withNav>
      <div style={{ padding: '8px 16px' }}>
        <SessionSearchBar mobile />
      </div>
      {children}
      {/* ↓ cloud slot ↓ */}

      {/* ↑ cloud slot ↑ */}
    </MobileContentLayout>
  );
};

export default MobileLayout;
