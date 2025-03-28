import { Avatar, Tooltip } from '@lobehub/ui';
import { Divider } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { Flexbox } from 'react-layout-kit';

import { useSwitchSession } from '@/hooks/useSwitchSession';
import { useSessionStore } from '@/store/session';
import { sessionHelpers } from '@/store/session/helpers';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum, KeyEnum } from '@/types/hotkey';

const useStyles = createStyles(({ css, token }) => ({
  avatar: css`
    position: relative;
    transition: all 200ms ease-out 0s;

    &:hover {
      box-shadow: 0 0 0 2px ${token.colorPrimary};
    }
  `,
  ink: css`
    &::before {
      content: '';

      position: absolute;
      inset-block-start: 50%;
      inset-inline: -${12 + 3}px;
      transform: translateY(-50%);

      width: 4px;
      height: 0;
      border-radius: 50px;

      background: ${token.colorPrimary};

      transition: height 150ms ease-out;
    }
  `,
  inkActive: css`
    &::before {
      width: 8px;
      height: 32px;
    }
  `,
}));

const PinList = () => {
  const { styles, cx } = useStyles();
  const list = useSessionStore(sessionSelectors.pinnedSessions, isEqual);
  const [activeId] = useSessionStore((s) => [s.activeId]);
  const switchSession = useSwitchSession();
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.SwitchAgent));
  const hasList = list.length > 0;
  const [isPinned, setPinned] = useQueryState('pinned', parseAsBoolean);

  const switchAgent = (id: string) => {
    switchSession(id);
    setPinned(true);
  };

  return (
    hasList && (
      <>
        <Divider style={{ margin: '8px 12px' }} />
        <Flexbox flex={1} gap={12} height={'100%'}>
          {list.slice(0, 9).map((item, index) => (
            <Flexbox key={item.id} style={{ position: 'relative' }}>
              <Tooltip
                hotkey={hotkey.replaceAll(KeyEnum.Number, String(index + 1))}
                placement={'right'}
                title={sessionHelpers.getTitle(item.meta)}
              >
                <Flexbox
                  className={cx(
                    styles.ink,
                    isPinned && activeId === item.id ? styles.inkActive : undefined,
                  )}
                >
                  <Avatar
                    avatar={sessionHelpers.getAvatar(item.meta)}
                    background={item.meta.backgroundColor}
                    className={cx(styles.avatar)}
                    onClick={() => {
                      switchAgent(item.id);
                    }}
                  />
                </Flexbox>
              </Tooltip>
            </Flexbox>
          ))}
        </Flexbox>
      </>
    )
  );
};

export default PinList;
