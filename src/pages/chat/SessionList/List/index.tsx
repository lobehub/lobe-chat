import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { shallow } from 'zustand/shallow';

import { sessionSelectors, useChatStore } from '@/store/session';

import SessionItem from './SessionItem';

export const useStyles = createStyles(({ css, token }) => ({
  button: css`
    position: sticky;
    z-index: 30;
    bottom: 0;

    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;

    margin-top: 8px;
    padding: 12px 12px;

    background: ${rgba(token.colorBgLayout, 0.5)};
    backdrop-filter: blur(8px);
  `,
}));

const SessionList = memo(() => {
  const [list, activeId, loading] = useChatStore(
    (s) => [sessionSelectors.chatList(s), s.activeId, s.loading.summarizingTitle],
    shallow,
  );

  return (
    <>
      {list.map(({ id }) => (
        <SessionItem key={id} active={activeId === id} id={id} simple={false} loading={loading && id === activeId} />
      ))}
    </>
  );
});

export default SessionList;
