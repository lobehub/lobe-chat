import isEqual from 'fast-deep-equal';
import Link from 'next/link';
import { memo } from 'react';

import { useSessionHydrated, useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import AddButton from './AddButton';
import SessionItem from './Item';
import SkeletonList from './SkeletonList';

const SessionList = memo(() => {
  const list = useSessionStore(sessionSelectors.sessionList, isEqual);
  const activeSession = useSessionStore((s) => s.activeSession);

  const isInit = useSessionHydrated();

  return !isInit ? (
    <SkeletonList />
  ) : list.length > 0 ? (
    list.map(({ id }) => (
      <Link
        href={`/chat#session=${id}`}
        key={id}
        onClick={(e) => {
          e.preventDefault();
          activeSession(id);
        }}
      >
        <SessionItem id={id} />
      </Link>
    ))
  ) : (
    <AddButton />
  );
});

export default SessionList;
