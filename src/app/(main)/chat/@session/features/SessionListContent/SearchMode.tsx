import { memo } from 'react';

import { useSessionStore } from '@/store/session';

import SessionList from './List';
import SkeletonList from './SkeletonList';

const SearchMode = memo(() => {
  const [sessionSearchKeywords, useSearchSessions] = useSessionStore((s) => [
    s.sessionSearchKeywords,
    s.useSearchSessions,
  ]);

  const { data, isLoading } = useSearchSessions(sessionSearchKeywords);

  return isLoading ? <SkeletonList /> : <SessionList dataSource={data} showAddButton={false} />;
});

SearchMode.displayName = 'SessionSearchMode';

export default SearchMode;
