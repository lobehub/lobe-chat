import { useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import Link from 'next/link';
import { memo } from 'react';

import { SESSION_CHAT_URL } from '@/const/url';
import { useSessionHydrated, useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import AddButton from './AddButton';
import SessionItem from './Item';
import SkeletonList from './SkeletonList';

const SessionList = memo(() => {
  const list = useSessionStore(sessionSelectors.sessionList, isEqual);
  const [activeSession, switchSession] = useSessionStore((s) => [s.activeSession, s.switchSession]);

  const isInit = useSessionHydrated();

  const { mobile } = useResponsive();

  return !isInit ? (
    <SkeletonList />
  ) : list.length > 0 ? (
    list.map(({ id }) => (
      <Link
        href={SESSION_CHAT_URL(id, mobile)}
        key={id}
        // replace onClick with onPointerDown to prevent double click on mobile
        onPointerDown={(e) => {
          e.preventDefault();

          if (mobile) switchSession(id);
          else activeSession(id);
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
