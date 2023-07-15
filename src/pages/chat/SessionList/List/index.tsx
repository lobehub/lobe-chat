import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useStyles } from '@/pages/chat/SessionList/List/style';
import { sessionSelectors, useChatStore } from '@/store/session';

import SessionItem from './SessionItem';

const SessionList = memo(() => {
  const { styles, cx } = useStyles();
  const list = useChatStore((s) => sessionSelectors.chatList(s), isEqual);
  const [activeId, loading] = useChatStore(
    (s) => [s.activeId, s.loading.summarizingTitle],
    shallow,
  );

  return (
    <Flexbox className={cx(styles.list)}>
      {list.map(({ id }) => (
        <SessionItem
          active={activeId === id}
          id={id}
          key={id}
          loading={loading && id === activeId}
        />
      ))}
    </Flexbox>
  );
});

export default SessionList;
