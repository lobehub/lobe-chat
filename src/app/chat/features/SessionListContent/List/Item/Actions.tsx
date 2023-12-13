import { ActionIcon, Icon } from '@lobehub/ui';
import { App, Dropdown, type MenuProps } from 'antd';
import { createStyles } from 'antd-style';
import { HardDriveDownload, MoreVertical, Pin, PinOff, Trash } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { configService } from '@/services/config';
import { useSessionStore } from '@/store/session';
import { sessionHelpers } from '@/store/session/helpers';
import { sessionSelectors } from '@/store/session/selectors';

const useStyles = createStyles(({ css }) => ({
  modalRoot: css`
    z-index: 2000;
  `,
}));

interface ActionProps {
  id: string;
  setOpen: (open: boolean) => void;
}

const Actions = memo<ActionProps>(({ id, setOpen }) => {
  const { t } = useTranslation('common');

  const { styles } = useStyles();

  const [pin, removeSession, pinSession] = useSessionStore((s) => {
    const session = sessionSelectors.getSessionById(id)(s);
    return [sessionHelpers.getSessionPinned(session), s.removeSession, s.pinSession];
  });

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
              configService.exportSingleAgent(id);
            },
          },
          {
            key: 'agentWithMessage',
            label: <div>{t('exportType.agentWithMessage')}</div>,
            onClick: () => {
              configService.exportSingleSession(id);
            },
          },
        ],
        icon: <Icon icon={HardDriveDownload} />,
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
            cancelText: t('cancel'),
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

  return (
    <Dropdown
      arrow={false}
      menu={{
        items,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
        },
      }}
      onOpenChange={setOpen}
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
  );
});

export default Actions;
