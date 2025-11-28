import { Icon, type MenuProps } from '@lobehub/ui';
import { App } from 'antd';
import { ExternalLink, LucideCopy, PencilLine, Trash, Wand2 } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { isDesktop } from '@/const/version';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

interface TopicItemDropdownMenuProps {
  id?: string;
  toggleEditing: (visible?: boolean) => void;
}

export const useTopicItemDropdownMenu = ({
  id,
  toggleEditing,
}: TopicItemDropdownMenuProps): MenuProps['items'] => {
  const { t } = useTranslation(['topic', 'common']);
  const { modal } = App.useApp();

  const openTopicInNewWindow = useGlobalStore((s) => s.openTopicInNewWindow);
  const activeSessionId = useSessionStore((s) => s.activeId);

  const [autoRenameTopicTitle, duplicateTopic, removeTopic] = useChatStore((s) => [
    s.autoRenameTopicTitle,
    s.duplicateTopic,
    s.removeTopic,
  ]);

  return useMemo(() => {
    if (!id) return [];

    return [
      {
        icon: <Icon icon={Wand2} />,
        key: 'autoRename',
        label: t('actions.autoRename'),
        onClick: () => {
          autoRenameTopicTitle(id);
        },
      },
      {
        icon: <Icon icon={PencilLine} />,
        key: 'rename',
        label: t('rename', { ns: 'common' }),
        onClick: () => {
          toggleEditing(true);
        },
      },
      ...(isDesktop
        ? [
            {
              icon: <Icon icon={ExternalLink} />,
              key: 'openInNewWindow',
              label: t('actions.openInNewWindow'),
              onClick: () => {
                openTopicInNewWindow(activeSessionId, id);
              },
            },
          ]
        : []),
      {
        type: 'divider' as const,
      },
      {
        icon: <Icon icon={LucideCopy} />,
        key: 'duplicate',
        label: t('actions.duplicate'),
        onClick: () => {
          duplicateTopic(id);
        },
      },
      {
        type: 'divider' as const,
      },
      {
        danger: true,
        icon: <Icon icon={Trash} />,
        key: 'delete',
        label: t('delete', { ns: 'common' }),
        onClick: () => {
          modal.confirm({
            centered: true,
            okButtonProps: { danger: true },
            onOk: async () => {
              await removeTopic(id);
            },
            title: t('actions.confirmRemoveTopic'),
          });
        },
      },
    ].filter(Boolean) as MenuProps['items'];
  }, [
    id,
    activeSessionId,
    autoRenameTopicTitle,
    duplicateTopic,
    removeTopic,
    openTopicInNewWindow,
    toggleEditing,
    t,
    modal,
  ]);
};
