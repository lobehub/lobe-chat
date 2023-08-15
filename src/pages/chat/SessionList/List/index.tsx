import isEqual from 'fast-deep-equal';
import Link from 'next/link';
import { memo } from 'react';

import { sessionSelectors, useSessionHydrated, useSessionStore } from '@/store/session';

import AddButton from './AddButton';
import SessionItem from './Item';
import SkeletonList from './SkeletonList';

const SessionList = memo(() => {
  const list = useSessionStore(sessionSelectors.sessionList, isEqual);

  const isInit = useSessionHydrated();

  return !isInit ? (
    <SkeletonList />
  ) : list.length > 0 ? (
    list.map(({ id }) => (
      <Link href={`/chat/${id}`} key={id}>
        <SessionItem id={id} />
      </Link>
    ))
  ) : (
    <AddButton />
  );
});

export default SessionList;
