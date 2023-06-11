import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { FC, memo } from 'react';
import { shallow } from 'zustand/shallow';

import { Avatar, List } from '@lobehub/ui';

import { useChatStore } from '@/store/session';

const useStyles = createStyles(({ css }) => {
  return {
    time: css`
      align-self: flex-start;
    `,
  };
});

interface SessionItemProps {
  active: boolean;
  id: string;
  loading: boolean;
  simple?: boolean;
}

const SessionItem: FC<SessionItemProps> = memo(({ id, active, simple = true, loading }) => {
  const { styles, theme } = useStyles();
  const {
    title,
    content: systemRole,
    avatar,
    avatarBackground,
    updateAt,
  } = useChatStore((s) => s.agents[id] || {}, isEqual);
  const [switchAgent] = useChatStore((s) => [s.switchAgent], shallow);

  const displayTitle = title || systemRole || '默认角色';

  return (
    <List.Item
      loading={loading}
      title={displayTitle}
      description={simple ? undefined : systemRole}
      active={active}
      date={updateAt}
      classNames={{ time: styles.time }}
      avatar={
        <Avatar
          avatar={avatar}
          size={46}
          shape="circle"
          title={displayTitle}
          background={avatarBackground}
        />
      }
      onClick={() => {
        switchAgent(id);
      }}
      style={{
        color: theme.colorText,
        alignItems: 'center',
      }}
    />
  );
});

export default SessionItem;
