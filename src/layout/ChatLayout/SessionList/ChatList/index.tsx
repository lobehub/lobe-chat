import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useChatStore } from 'src/store/session';

import SessionItem from './SessionItem';

import { agentSelectors } from '@/store/session/selectors';

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

export const ChatList = memo(() => {
  const [list, activeId, loading] = useChatStore(
    (s) => [agentSelectors.agentList(s), s.activeId, s.loading.summarizingTitle],
    shallow,
  );

  return (
    <>
      {list.map(({ id }) => (
        <Flexbox key={id} gap={4} paddingBlock={4}>
          <SessionItem
            active={activeId === id}
            key={id}
            id={id}
            simple={false}
            loading={loading && id === activeId}
          />
        </Flexbox>
      ))}
    </>
  );
});
