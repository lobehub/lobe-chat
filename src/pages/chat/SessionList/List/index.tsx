import isEqual from 'fast-deep-equal';
import Link from 'next/link';
import { memo } from 'react';

import { sessionSelectors, useSessionHydrated, useSessionStore } from '@/store/session';

import SessionItem from './SessionItem';
import SkeletonItem from './SkeletonItem';

const SessionList = memo(() => {
  const list = useSessionStore(sessionSelectors.sessionList, isEqual);
  const [activeId, loading] = useSessionStore((s) => [s.activeId, s.autocompleteLoading.title]);

  const isInit = useSessionHydrated();

  return !isInit ? (
    <SkeletonItem />
  ) : (
    <>
      {list.map(({ id }) => (
        <Link href={`/chat/${id}`} key={id}>
          <SessionItem active={activeId === id} id={id} loading={loading && id === activeId} />
        </Link>
      ))}
    </>
  );
});

export default SessionList;
