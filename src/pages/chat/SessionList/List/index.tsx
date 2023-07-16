import isEqual from 'fast-deep-equal';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { sessionSelectors, useSessionStore } from '@/store/session';

import SessionItem from './SessionItem';
import { useStyles } from './style';

const SessionList = memo(() => {
  const { styles, cx } = useStyles();
  const list = useSessionStore((s) => sessionSelectors.chatList(s), isEqual);
  const [activeId, loading] = useSessionStore(
    (s) => [s.activeId, s.autocompleteLoading.title],
    shallow,
  );

  return (
    <Flexbox className={cx(styles.list)}>
      {list.map(({ id }) => (
        <Link href={`/chat/${id}`} key={id}>
          <SessionItem active={activeId === id} id={id} loading={loading && id === activeId} />
        </Link>
      ))}
    </Flexbox>
  );
});

export default SessionList;
