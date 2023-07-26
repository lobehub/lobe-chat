import { ActionIcon, Avatar, Icon, List } from '@lobehub/ui';
import { useHover } from 'ahooks';
import { Dropdown, type MenuProps, Popconfirm, Tag } from 'antd';
import { FolderOutput, MoreVertical, Pin, PinOff, Trash } from 'lucide-react';
import { FC, memo, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { agentSelectors, chatSelectors, sessionSelectors, useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';

import { useStyles } from './style';

const { Item } = List;

interface SessionItemProps {
  active?: boolean;
  id: string;
  loading?: boolean;
  pin?: boolean;
}

const SessionItem: FC<SessionItemProps> = memo(({ id, active = true, loading, pin }) => {
  const ref = useRef(null);
  const isHovering = useHover(ref);
  const [popOpen, setPopOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t } = useTranslation('common');
  const isHighlight = isHovering || dropdownOpen;
  const { styles, theme, cx } = useStyles(isHighlight);
  const [defaultModel] = useSettings((s) => [s.settings.model], shallow);

  const [
    title,
    description,
    systemRole,
    avatar,
    avatarBackground,
    updateAt,
    model,
    chatLength,
    removeSession,
  ] = useSessionStore((s) => {
    const session = sessionSelectors.getSessionById(id)(s);
    const meta = session.meta;
    const systemRole = session.config.systemRole;
    return [
      agentSelectors.getTitle(meta),
      meta.description,
      systemRole,
      agentSelectors.getAvatar(meta),
      meta.backgroundColor,
      session?.updateAt,
      session.config.model,
      chatSelectors.currentChats(s).length,
      s.removeSession,
    ];
  }, shallow);

  // TODO: 动作绑定
  const items: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={pin ? PinOff : Pin} />,
        key: 'pin',
        label: t(pin ? 'pinOff' : 'pin'),
      },
      {
        children: [
          {
            key: 'agent',
            label: <div>{t('exportType.agent')}</div>,
          },
          {
            key: 'agentWithMessage',
            label: <div>{t('exportType.agentWithMessage')}</div>,
          },
        ],
        icon: <Icon icon={FolderOutput} />,
        key: 'export',
        label: t('export'),
      },
      {
        icon: <Icon icon={Trash} />,
        key: 'delete',
        label: t('delete'),
        onClick: () => setPopOpen(true),
      },
    ],
    [id],
  );

  const showModel = model !== defaultModel;
  const showChatLength = chatLength > 0;

  return (
    <div ref={ref}>
      <Flexbox className={cx(styles.container, pin && styles.pin)} style={{ position: 'relative' }}>
        <Item
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
          className={isHighlight ? styles.hover : undefined}
          classNames={{ time: cx('session-time', styles.time) }}
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
                  {/*{showChatLength && (*/}
                  {/*  <Tag*/}
                  {/*    bordered={false}*/}
                  {/*    style={{ color: theme.colorTextSecondary, display: 'flex', gap: 4 }}*/}
                  {/*  >*/}
                  {/*    <Icon icon={LucideMessageCircle} />*/}
                  {/*    {chatLength}*/}
                  {/*  </Tag>*/}
                  {/*)}*/}
                </Flexbox>
              )}
            </Flexbox>
          }
          loading={loading}
          style={{ color: theme.colorText }}
          title={title}
        />
        <Popconfirm
          arrow={false}
          cancelText={t('cancel')}
          okButtonProps={{ danger: true }}
          okText={t('ok')}
          onCancel={() => setPopOpen(false)}
          onConfirm={(e) => {
            e?.stopPropagation();
            removeSession(id);
            setPopOpen(false);
          }}
          open={popOpen}
          overlayStyle={{ width: 280 }}
          title={t('confirmRemoveSessionItemAlert')}
        >
          <Dropdown
            arrow={false}
            menu={{ items }}
            onOpenChange={setDropdownOpen}
            open={dropdownOpen}
            trigger={['click']}
          >
            <ActionIcon
              className="session-remove"
              icon={MoreVertical}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              size={{
                blockSize: 28,
                fontSize: 16,
              }}
            />
          </Dropdown>
        </Popconfirm>
      </Flexbox>
    </div>
  );
}, shallow);

export default SessionItem;
