import { ActionIcon, Avatar, Icon, List } from '@lobehub/ui';
import { useHover } from 'ahooks';
import { App, Dropdown, type MenuProps, Tag } from 'antd';
import { FolderOutput, MoreVertical, Pin, PinOff, Trash } from 'lucide-react';
import { FC, memo, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { exportSingleAgent, exportSingleSession } from '@/helpers/export';
import { agentSelectors, chatSelectors, sessionSelectors, useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';

import { useStyles } from './style';

const { Item } = List;

interface SessionItemProps {
  active?: boolean;
  id: string;
  loading?: boolean;
}

const SessionItem: FC<SessionItemProps> = memo(({ id, active = true, loading }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isHovering = useHover(ref);

  const { t } = useTranslation('common');

  const { styles, theme } = useStyles();
  const [defaultModel] = useSettings((s) => [s.settings.model], shallow);

  const [
    pin,
    title,
    description,
    systemRole,
    avatar,
    avatarBackground,
    updateAt,
    model,
    chatLength,
    removeSession,
    pinSession,
  ] = useSessionStore((s) => {
    const session = sessionSelectors.getSessionById(id)(s);
    const meta = session.meta;
    const systemRole = session.config.systemRole;
    return [
      session.pinned,
      agentSelectors.getTitle(meta),
      agentSelectors.getDescription(meta),
      systemRole,
      agentSelectors.getAvatar(meta),
      meta.backgroundColor,
      session?.updateAt,
      session.config.model,
      chatSelectors.getChatsById(id)(s).length,
      s.removeSession,
      s.pinSession,
    ];
  }, shallow);

  const { modal } = App.useApp();
  const items: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={pin ? PinOff : Pin} />,
        key: 'pin',
        label: t(pin ? 'pinOff' : 'pin'),
        onClick: () => {
          pinSession(id, !pin);
        },
      },
      {
        children: [
          {
            key: 'agent',
            label: <div>{t('exportType.agent')}</div>,
            onClick: () => {
              exportSingleAgent(id);
            },
          },
          {
            key: 'agentWithMessage',
            label: <div>{t('exportType.agentWithMessage')}</div>,
            onClick: () => {
              exportSingleSession(id);
            },
          },
        ],
        icon: <Icon icon={FolderOutput} />,
        key: 'export',
        label: t('export'),
      },
      {
        danger: true,
        icon: <Icon icon={Trash} />,
        key: 'delete',
        label: t('delete'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();

          modal.confirm({
            centered: true,
            okButtonProps: { danger: true },
            okText: t('ok'),
            onOk: () => {
              removeSession(id);
            },
            rootClassName: styles.modalRoot,
            title: t('confirmRemoveSessionItemAlert'),
          });
        },
      },
    ],
    [id, pin],
  );

  const showModel = model !== defaultModel;
  const showChatLength = chatLength > 0;

  return (
    <Item
      actions={
        <Dropdown
          arrow={false}
          menu={{
            items,
            onClick: ({ domEvent }) => {
              domEvent.stopPropagation();
            },
          }}
          onOpenChange={setOpen}
          open={open}
          trigger={['click']}
        >
          <ActionIcon
            icon={MoreVertical}
            size={{
              blockSize: 28,
              fontSize: 16,
            }}
          />
        </Dropdown>
      }
      active={active}
      avatar={
        <Avatar
          animation={isHovering}
          avatar={avatar}
          background={avatarBackground}
          shape="circle"
          size={46}
          title={title}
        />
      }
      className={styles.container}
      date={updateAt}
      description={
        <Flexbox gap={4}>
          <Flexbox>{description || systemRole}</Flexbox>

          {!(showModel || showChatLength) ? undefined : (
            <Flexbox horizontal>
              {showModel && (
                <Tag bordered={false} style={{ color: theme.colorTextSecondary }}>
                  {model}
                </Tag>
              )}
            </Flexbox>
          )}
        </Flexbox>
      }
      loading={loading}
      pin={pin}
      ref={ref}
      showAction={open || isHovering}
      title={title}
    />
  );
}, shallow);

export default SessionItem;
