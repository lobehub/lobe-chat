import { ActionIcon, Icon } from '@lobehub/ui';
import { App, Dropdown, type MenuProps } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import {
  ArrowLeftRight,
  HardDriveDownload,
  LucideCopy,
  MoreVertical,
  Pin,
  PinOff,
  Trash,
} from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { configService } from '@/services/config';
import { useSessionStore } from '@/store/session';
import { sessionHelpers } from '@/store/session/helpers';
import { sessionSelectors } from '@/store/session/selectors';
import { SessionGroupDefaultKeys } from '@/types/session';

const useStyles = createStyles(({ css }) => ({
  modalRoot: css`
    z-index: 2000;
  `,
}));

interface ActionProps {
  group: string | undefined;
  id: string;
  setIsModalOpen: (open: boolean) => void;
  setOpen: (open: boolean) => void;
}

const Actions = memo<ActionProps>(({ group, id, setIsModalOpen, setOpen }) => {
  const { t } = useTranslation('common');

  const { styles } = useStyles();

  const customSessionGroup = useSessionStore(sessionSelectors.customSessionGroup, isEqual);
  const [pin, removeSession, pinSession, duplicateSession, updateSessionGroup] = useSessionStore(
    (s) => {
      const session = sessionSelectors.getSessionById(id)(s);
      return [
        sessionHelpers.getSessionPinned(session),
        s.removeSession,
        s.pinSession,
        s.duplicateSession,
        s.updateSessionGroup,
      ];
    },
  );

  const { modal } = App.useApp();

  const isDefault = group === SessionGroupDefaultKeys.Default;
  const hasDivider = !isDefault || Object.keys(customSessionGroup).length > 0;

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
            key: 'newGroup',
            label: <div>{t('group.newGroup')}</div>,
            onClick: ({ domEvent }) => {
              domEvent.stopPropagation();
              setIsModalOpen(true);
            },
          },
          hasDivider && {
            type: 'divider',
          },
          !isDefault && {
            key: 'defaultList',
            label: <div>{t('defaultList')}</div>,
            onClick: () => {
              updateSessionGroup(id, SessionGroupDefaultKeys.Default);
            },
          },
          ...Object.keys(customSessionGroup)
            .filter((key) => key !== group)
            .map((key) => ({
              key,
              label: <div>{key}</div>,
              onClick: () => {
                updateSessionGroup(id, key);
              },
            })),
        ],
        icon: <Icon icon={ArrowLeftRight} />,
        key: 'moveGroup',
        label: t('group.moveGroup'),
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
        type: 'divider',
      },
      {
        icon: <Icon icon={LucideCopy} />,
        key: 'duplicate',
        label: t('duplicate'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();

          duplicateSession(id);
        },
      },
      {
        type: 'divider',
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
