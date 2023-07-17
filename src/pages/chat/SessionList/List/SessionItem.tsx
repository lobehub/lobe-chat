import { ActionIcon, Avatar, List } from '@lobehub/ui';
import { Popconfirm } from 'antd';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FC, memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { sessionSelectors, useSessionStore } from '@/store/session';
import { DEFAULT_TITLE } from '@/store/session/slices/agentConfig';

import { useStyles } from './style';

const { Item } = List;

interface SessionItemProps {
  active: boolean;
  id: string;
  loading: boolean;
}

const SessionItem: FC<SessionItemProps> = memo(({ id, active = true, loading }) => {
  const { t } = useTranslation('common');
  const { styles, theme, cx } = useStyles();
  const [title, description, systemRole, avatar, avatarBackground, updateAt, removeSession] =
    useSessionStore((s) => {
      const session = sessionSelectors.getSessionById(id)(s);
      const meta = session.meta;
      const systemRole = session.config.systemRole;
      return [
        meta.title,
        meta.description,
        systemRole,
        sessionSelectors.getAgentAvatar(meta),
        meta.backgroundColor,
        session?.updateAt,
        s.removeSession,
      ];
    }, shallow);

  return (
    <Flexbox className={styles.container} style={{ position: 'relative' }}>
      <Item
        active={active}
        avatar={
          <Avatar
            avatar={avatar}
            background={avatarBackground}
            shape="circle"
            size={46}
            title={title}
          />
        }
        classNames={{ time: cx('session-time', styles.time) }}
        date={updateAt}
        description={description || systemRole}
        loading={loading}
        style={{
          alignItems: 'center',
          color: theme.colorText,
        }}
        title={title || DEFAULT_TITLE}
      />
      <Popconfirm
        arrow={false}
        cancelText={t('cancel')}
        okButtonProps={{ danger: true }}
        okText={t('ok')}
        onConfirm={(e) => {
          e?.stopPropagation();
          removeSession(id);
        }}
        overlayStyle={{ width: 280 }}
        title={t('confirmRemoveSessionItemAlert')}
      >
        <ActionIcon
          className="session-remove"
          icon={X}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          size={'small'}
        />
      </Popconfirm>
    </Flexbox>
  );
}, shallow);

export default SessionItem;
