import { memo } from 'react';

import SessionListContent from '../../features/SessionListContent';
import SessionSearchBar from '../../features/SessionSearchBar';

const Sessions = memo(() => {
  return (
    <>
      <div style={{ padding: '8px 16px' }}>
        <SessionSearchBar mobile />
      </div>
      <SessionListContent />
    </>
  );
});

export default Sessions;
