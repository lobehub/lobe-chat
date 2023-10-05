import { ReactNode, memo } from 'react';

import SessionSearchBar from '../../features/SessionSearchBar';

const Sessions = memo<{ children: ReactNode }>(({ children }) => {
  return (
    <>
      <div style={{ padding: '8px 16px' }}>
        <SessionSearchBar />
      </div>
      {children}
    </>
  );
});

export default Sessions;
