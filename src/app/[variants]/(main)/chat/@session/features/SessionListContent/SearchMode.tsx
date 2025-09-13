import { memo, useMemo } from 'react';

import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useSessionStore } from '@/store/session';
import { LobeSessions } from '@/types/session';

import SkeletonList from '../SkeletonList';
import SessionList from './List';

const SearchMode = memo(() => {
  const [sessionSearchKeywords, useSearchSessions] = useSessionStore((s) => [
    s.sessionSearchKeywords,
    s.useSearchSessions,
  ]);

  const isMobile = useServerConfigStore(serverConfigSelectors.isMobile);

  const { data, isLoading } = useSearchSessions(sessionSearchKeywords);

  // Filter out group sessions on mobile
  const filteredData = useMemo(() => {
    if (!isMobile || !data) return data;
    return data.filter((session: LobeSessions[0]) => session.type !== 'group');
  }, [data, isMobile]);

  return isLoading ? (
    <SkeletonList />
  ) : (
    <SessionList dataSource={filteredData} showAddButton={false} />
  );
});

SearchMode.displayName = 'SessionSearchMode';

export default SearchMode;
