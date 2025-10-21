import { ActionIcon, Dropdown, Icon } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { ItemType } from 'antd/es/menu/interface';
import isEqual from 'fast-deep-equal';
import {
  Check,
  ExternalLink,
  HardDriveDownload,
  ListTree,
  LucideCopy,
  LucidePlus,
  MoreVertical,
  Pin,
  PinOff,
  Trash,
} from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { isDesktop, isServerMode } from '@/const/version';
import { configService } from '@/services/config';
import { useGlobalStore } from '@/store/global';
import { useChatGroupStore } from '@/store/chatGroup';
import { useSessionStore } from '@/store/session';
import { sessionHelpers } from '@/store/session/helpers';
import { sessionGroupSelectors, sessionSelectors } from '@/store/session/selectors';
import { SessionDefaultGroup } from '@/types/session';

const useStyles = createStyles(({ css }) => ({
  modalRoot: css`
    z-index: 2000;
  `,
}));

interface ActionProps {
  group: string | undefined;
  id: string;
  openCreateGroupModal: () => void;
  parentType: 'agent' | 'group';
  setOpen: (open: boolean) => void;
}

const Actions = memo<ActionProps>(({ group, id, openCreateGroupModal, parentType, setOpen }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('chat');

  const openSessionInNewWindow = useGlobalStore((s) => s.openSessionInNewWindow);

  const sessionCustomGroups = useSessionStore(sessionGroupSelectors.sessionGroupItems, isEqual);
  const [pin, removeSession, pinSession, sessionType, duplicateSession, updateSessionGroup] =
    useSessionStore((s) => {
      const session = sessionSelectors.getSessionById(id)(s);
      return [
        sessionHelpers.getSessionPinned(session),
        s.removeSession,
        s.pinSession,
        session.type,
        s.duplicateSession,
        s.updateSessionGroupId,
      ];
    });

  const [deleteGroup, pinGroup] = useChatGroupStore((s) => [s.deleteGroup, s.pinGroup]);

  const { modal, message } = App.useApp();

  const isDefault = group === SessionDefaultGroup.Default;
  // const hasDivider = !isDefault || Object.keys(sessionByGroup).length > 0;

  const items = useMemo(
    () =>
      (
        [
          {
            icon: <Icon icon={pin ? PinOff : Pin} />,
            key: 'pin',
            label: t(pin ? 'pinOff' : 'pin'),
            onClick: () => {
              if (parentType === 'group') {
                pinGroup(id, !pin);
              } else {
                pinSession(id, !pin);
              }
            },
          },
          {
            icon: <Icon icon={LucideCopy} />,
            key: 'duplicate',
            label: t('duplicate', { ns: 'common' }),
            onClick: ({ domEvent }) => {
              domEvent.stopPropagation();

              duplicateSession(id);
            },
          },
          ...(isDesktop
            ? [
                {
                  icon: <Icon icon={ExternalLink} />,
                  key: 'openInNewWindow',
                  label: '单独打开页面',
                  onClick: ({ domEvent }: { domEvent: Event }) => {
                    domEvent.stopPropagation();
                    openSessionInNewWindow(id);
                  },
                },
              ]
            : []),
          {
            type: 'divider',
          },
          {
            children: [
              ...sessionCustomGroups.map(({ id: groupId, name }) => ({
                icon: group === groupId ? <Icon icon={Check} /> : <div />,
                key: groupId,
                label: name,
                onClick: () => {
                  updateSessionGroup(id, groupId);
                },
              })),
              {
                icon: isDefault ? <Icon icon={Check} /> : <div />,
                key: 'defaultList',
                label: t('defaultList'),
                onClick: () => {
                  updateSessionGroup(id, SessionDefaultGroup.Default);
                },
              },
              {
                type: 'divider',
              },
              {
                icon: <Icon icon={LucidePlus} />,
                key: 'createGroup',
                label: <div>{t('sessionGroup.createGroup')}</div>,
                onClick: ({ domEvent }) => {
                  domEvent.stopPropagation();
                  openCreateGroupModal();
                },
              },
            ],
            icon: <Icon icon={ListTree} />,
            key: 'moveGroup',
            label: t('sessionGroup.moveGroup'),
          },
          {
            type: 'divider',
          },
          isServerMode
            ? undefined
            : {
                children: [
                  {
                    key: 'agent',
                    label: t('exportType.agent', { ns: 'common' }),
                    onClick: () => {
                      configService.exportSingleAgent(id);
                    },
                  },
                  {
                    key: 'agentWithMessage',
                    label: t('exportType.agentWithMessage', { ns: 'common' }),
                    onClick: () => {
                      configService.exportSingleSession(id);
                    },
                  },
                ],
                icon: <Icon icon={HardDriveDownload} />,
                key: 'export',
                label: t('export', { ns: 'common' }),
              },
          {
            danger: true,
            icon: <Icon icon={Trash} />,
            key: 'delete',
            label: t('delete', { ns: 'common' }),
            onClick: ({ domEvent }) => {
              domEvent.stopPropagation();
              modal.confirm({
                centered: true,
                okButtonProps: { danger: true },
                onOk: async () => {
                  if (parentType === 'group') {
                    await deleteGroup(id);
                    message.success(t('confirmRemoveGroupSuccess'));
                  } else {
                    await removeSession(id);
                    message.success(t('confirmRemoveSessionSuccess'));
                  }
                },
                rootClassName: styles.modalRoot,
                title:
                  sessionType === 'group'
                    ? t('confirmRemoveChatGroupItemAlert')
                    : t('confirmRemoveSessionItemAlert'),
              });
            },
          },
        ] as ItemType[]
      ).filter(Boolean),
    [id, pin, openSessionInNewWindow],
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
          size: 16,
        }}
      />
    </Dropdown>
  );
});

export default Actions;
