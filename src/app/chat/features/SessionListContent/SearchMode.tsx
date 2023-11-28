import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import SessionList from './List';

const SessionListContent = memo(() => {
  const searchSessions = useSessionStore(sessionSelectors.searchSessions, isEqual);

  return <SessionList dataSource={searchSessions} />;
});

export default SessionListContent;
