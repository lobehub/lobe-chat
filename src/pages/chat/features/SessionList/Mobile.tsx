import { ReactNode, memo } from 'react';

import SessionSearchBar from '../SessionSearchBar';

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
