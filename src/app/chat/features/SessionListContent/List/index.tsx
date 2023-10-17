import { createStyles, useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import Link from 'next/link';
import { memo } from 'react';
import LazyLoad from 'react-lazy-load';

import { SESSION_CHAT_URL } from '@/const/url';
import { useSessionHydrated, useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import AddButton from './AddButton';
import SessionItem from './Item';
import SkeletonList from './SkeletonList';

const useStyles = createStyles(
  ({ css }) => css`
    min-height: 70px;
  `,
);

const SessionList = memo(() => {
  const list = useSessionStore(sessionSelectors.sessionList, isEqual);
  const [activeSession, switchSession] = useSessionStore((s) => [s.activeSession, s.switchSession]);
  const { styles } = useStyles();
  const isInit = useSessionHydrated();

  const { mobile } = useResponsive();

  return !isInit ? (
    <SkeletonList />
  ) : list.length > 0 ? (
    list.map(({ id }) => (
      <LazyLoad className={styles} key={id}>
        <Link
          aria-label={id}
          href={SESSION_CHAT_URL(id, mobile)}
          onClick={(e) => {
            e.preventDefault();
            if (mobile) switchSession(id);
            else activeSession(id);
          }}
        >
          <SessionItem id={id} />
        </Link>
      </LazyLoad>
    ))
  ) : (
    <AddButton />
  );
});

export default SessionList;
