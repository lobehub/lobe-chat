import { memo } from 'react';

import { useSessionStore } from '@/store/session';

import SessionListContent from '../../features/SessionListContent';
import SessionSearchBar from '../../features/SessionSearchBar';

const Sessions = memo(() => {
  const useFetchSessions = useSessionStore((s) => s.useFetchSessions);

  useFetchSessions();

  return (
    <>
      <div style={{ padding: '8px 16px' }}>
        <SessionSearchBar />
      </div>
      <SessionListContent />
    </>
  );
});

export default Sessions;
