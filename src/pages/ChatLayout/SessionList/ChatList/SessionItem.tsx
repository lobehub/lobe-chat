import { Avatar, List } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { FC, memo } from 'react';
import { shallow } from 'zustand/shallow';

import { chatSelectors, useChatStore } from '@/store/session';

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
  const [title, systemRole, avatar, avatarBackground, updateAt, switchAgent] = useChatStore((s) => {
    const session = chatSelectors.getSessionById(id)(s);
    const meta = session.meta;

    const systemRole = session.config.systemRole;

    return [
      meta.title || systemRole || '默认角色',
      systemRole,
      meta.avatar,
      meta.backgroundColor,
      session?.updateAt,
      s.switchChat,
    ];
  }, shallow);

  return (
    <List.Item
      loading={loading}
      title={title}
      description={simple ? undefined : systemRole}
      active={active}
      date={updateAt}
      classNames={{ time: styles.time }}
      avatar={
        <Avatar
          avatar={avatar}
          size={46}
          shape="circle"
          title={title}
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
