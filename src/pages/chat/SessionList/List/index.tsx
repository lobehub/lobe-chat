import isEqual from 'fast-deep-equal';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { sessionSelectors, useSessionHydrated, useSessionStore } from '@/store/session';

import SessionItem from './Item';
import SkeletonList from './SkeletonList';

const SessionList = memo(() => {
  const list = useSessionStore(sessionSelectors.sessionList, isEqual);

  const isInit = useSessionHydrated();

  return !isInit ? (
    <SkeletonList />
  ) : (
    <Flexbox>
      {list.map(({ id }) => (
        <Link href={`/chat/${id}`} key={id}>
          <SessionItem id={id} />
        </Link>
      ))}
    </Flexbox>
  );
});

export default SessionList;
