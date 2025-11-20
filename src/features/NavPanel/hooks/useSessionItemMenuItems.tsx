import { isDesktop } from '@lobechat/const';
import { SessionDefaultGroup } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { ItemType } from 'antd/es/menu/interface';
import isEqual from 'fast-deep-equal';
import {
  Check,
  ExternalLink,
  FolderInputIcon,
  LucideCopy,
  LucidePlus,
  Pin,
  PinOff,
  Trash,
} from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatGroupStore } from '@/store/chatGroup';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionGroupSelectors } from '@/store/session/selectors';

const useStyles = createStyles(({ css }) => ({
  modalRoot: css`
    z-index: 2000;
  `,
}));

/**
 * Hook for generating menu items for individual session/agent items
 * Used in List/Item/Actions.tsx
 */
export const useSessionItemMenuItems = () => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const { modal, message } = App.useApp();

  const openSessionInNewWindow = useGlobalStore((s) => s.openSessionInNewWindow);
  const sessionCustomGroups = useSessionStore(sessionGroupSelectors.sessionGroupItems, isEqual);

  const [pinSession, duplicateSession, updateSessionGroup, removeSession] = useSessionStore((s) => [
    s.pinSession,
    s.duplicateSession,
    s.updateSessionGroupId,
    s.removeSession,
  ]);

  const [pinGroup, deleteGroup] = useChatGroupStore((s) => [s.pinGroup, s.deleteGroup]);

  /**
   * Pin/Unpin menu item
   */
  const pinMenuItem = useCallback(
    (id: string, isPinned: boolean, parentType: 'agent' | 'group'): ItemType => {
      const iconElement = <Icon icon={isPinned ? PinOff : Pin} />;
      return {
        icon: iconElement,
        key: 'pin',
        label: t(isPinned ? 'pinOff' : 'pin'),
        onClick: () => {
          if (parentType === 'group') {
            pinGroup(id, !isPinned);
          } else {
            pinSession(id, !isPinned);
          }
        },
      };
    },
    [t, pinGroup, pinSession],
  );

  /**
   * Duplicate session menu item
   */
  const duplicateMenuItem = useCallback(
    (id: string): ItemType => {
      const iconElement = <Icon icon={LucideCopy} />;
      return {
        icon: iconElement,
        key: 'duplicate',
        label: t('duplicate', { ns: 'common' }),
        onClick: ({ domEvent }: any) => {
          domEvent.stopPropagation();
          duplicateSession(id);
        },
      };
    },
    [t, duplicateSession],
  );

  /**
   * Open in new window menu item (desktop only)
   * Returns null on non-desktop platforms
   */
  const openInNewWindowMenuItem = useCallback(
    (id: string): ItemType | null => {
      if (!isDesktop) return null;

      const iconElement = <Icon icon={ExternalLink} />;
      return {
        icon: iconElement,
        key: 'openInNewWindow',
        label: t('openInNewWindow'),
        onClick: ({ domEvent }: any) => {
          domEvent.stopPropagation();
          openSessionInNewWindow(id);
        },
      };
    },
    [t, openSessionInNewWindow],
  );

  /**
   * Move to group submenu item
   * Contains all custom groups, default list, and create new group option
   */
  const moveToGroupMenuItem = useCallback(
    (
      id: string,
      currentGroup: string | undefined,
      onOpenCreateGroupModal: () => void,
    ): ItemType => {
      const isDefault = currentGroup === SessionDefaultGroup.Default;

      const children = [
        ...sessionCustomGroups.map(({ id: groupId, name }) => {
          const checkIcon = currentGroup === groupId ? <Icon icon={Check} /> : <div />;
          return {
            icon: checkIcon,
            key: groupId,
            label: name,
            onClick: () => {
              updateSessionGroup(id, groupId);
            },
          };
        }),
        {
          icon: isDefault ? <Icon icon={Check} /> : <div />,
          key: 'defaultList',
          label: t('defaultList'),
          onClick: () => {
            updateSessionGroup(id, SessionDefaultGroup.Default);
          },
        },
        {
          type: 'divider' as const,
        },
        {
          icon: <Icon icon={LucidePlus} />,
          key: 'createGroup',
          label: <div>{t('sessionGroup.createGroup')}</div>,
          onClick: ({ domEvent }: any) => {
            domEvent.stopPropagation();
            onOpenCreateGroupModal();
          },
        },
      ];

      const folderIcon = <Icon icon={FolderInputIcon} />;
      return {
        children,
        icon: folderIcon,
        key: 'moveGroup',
        label: t('sessionGroup.moveGroup'),
      };
    },
    [t, sessionCustomGroups, updateSessionGroup],
  );

  /**
   * Delete menu item with confirmation modal
   * Handles both session and group types
   */
  const deleteMenuItem = useCallback(
    (id: string, parentType: 'agent' | 'group', sessionType?: string): ItemType => {
      const trashIcon = <Icon icon={Trash} />;
      return {
        danger: true,
        icon: trashIcon,
        key: 'delete',
        label: t('delete', { ns: 'common' }),
        onClick: ({ domEvent }: any) => {
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
      };
    },
    [t, modal, styles.modalRoot, deleteGroup, message, removeSession],
  );

  return {
    deleteMenuItem,
    duplicateMenuItem,
    moveToGroupMenuItem,
    openInNewWindowMenuItem,
    pinMenuItem,
  };
};
