import { Avatar, List } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { FC, memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { sessionSelectors, useChatStore } from '@/store/session';
import { CloseOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';

const useStyles = createStyles(({ css, cx }) => {
  const closeCtn = css`
    position: absolute;
    top: 50%;
    left: 2px;
    transform: translateY(-50%);

    width: 16px;
    height: 16px;

    font-size: 10px;

    opacity: 0;
  `;
  return {
    container: css`
      position: relative;

      &:hover {
        .${cx(closeCtn)} {
          opacity: 1;
        }
      }
    `,
    time: css`
      align-self: flex-start;
    `,
    closeCtn,
    active: css`
      opacity: 1;
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
  const { styles, theme, cx } = useStyles();
  const [title, systemRole, avatar, avatarBackground, updateAt, switchAgent, removeSession] = useChatStore((s) => {
    const session = sessionSelectors.getSessionById(id)(s);
    const meta = session.meta;

    const systemRole = session.config.systemRole;

    return [
      meta.title || systemRole || '默认角色',
      systemRole,
      sessionSelectors.getAgentAvatar(meta),
      meta.backgroundColor,
      session?.updateAt,
      s.switchSession,
      s.removeSession,
    ];
  }, shallow);

  return (
    <Flexbox gap={4} paddingBlock={4} className={styles.container}>
      <Popconfirm
        title={'即将删除该会话，删除后该将无法找回，请确认你的操作。'}
        placement={'right'}
        arrow={false}
        overlayStyle={{ width: 280 }}
        okButtonProps={{ danger: true }}
        onConfirm={() => removeSession(id)}
      >
        <CloseOutlined className={cx(styles.closeCtn, active && styles.active)} />
      </Popconfirm>
      <List.Item
        loading={loading}
        title={title}
        description={simple ? undefined : systemRole}
        active={active}
        date={updateAt}
        classNames={{ time: styles.time }}
        avatar={<Avatar avatar={avatar} size={46} shape="circle" title={title} background={avatarBackground} />}
        onClick={() => {
          switchAgent(id);
        }}
        style={{
          alignItems: 'center',
          color: theme.colorText,
        }}
      />
    </Flexbox>
  );
});

export default SessionItem;
