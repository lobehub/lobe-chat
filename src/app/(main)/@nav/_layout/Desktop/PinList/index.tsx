import { Avatar, Tooltip } from '@lobehub/ui';
import { Divider } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { useHotkeys } from 'react-hotkeys-hook';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

const useStyles = createStyles(({ css, token }) => ({
  avatar: css`
    position: relative;
    transition: all 200ms ease-out 0s;

    &:hover {
      box-shadow: 0 0 0 2px ${token.colorPrimary};
    }
  `,
  avatarActive: css`
    background: ${token.colorFillQuaternary};
    box-shadow: 0 0 0 2px ${token.colorPrimaryBorder};
  `,
}));

const PinList = () => {
  const { styles, cx } = useStyles();
  const list = useSessionStore(sessionSelectors.pinnedSessions, isEqual);
  const [activeId, switchSession] = useSessionStore((s) => [s.activeId, s.switchSession]);

  const hasList = list.length > 0;
  const [isPinned, setPinned] = useQueryState('pinned', parseAsBoolean);

  const switchAgent = (id: string) => {
    switchSession(id);
    setPinned(true);
  };

  useHotkeys(
    list.slice(0, 9).map((e, i) => `ctrl+${i + 1}`),
    (keyboardEvent, hotkeysEvent) => {
      if (!hotkeysEvent.keys?.[0]) return;

      const index = parseInt(hotkeysEvent.keys?.[0]) - 1;
      const item = list[index];
      if (!item) return;

      switchAgent(item.id);
    },
    { enableOnFormTags: true, preventDefault: true },
  );

  return (
    hasList && (
      <>
        <Divider style={{ margin: '8px 12px' }} />
        <Flexbox flex={1} gap={12} height={'100%'}>
          {list.map((item) => (
            <Tooltip key={item.id} placement={'right'} title={item.meta.title}>
              <Avatar
                avatar={item.meta.avatar}
                background={item.meta.backgroundColor}
                className={cx(
                  styles.avatar,
                  isPinned && activeId === item.id ? styles.avatarActive : undefined,
                )}
                onClick={() => {
                  switchAgent(item.id);
                }}
              />
            </Tooltip>
          ))}
        </Flexbox>
      </>
    )
  );
};

export default PinList;
