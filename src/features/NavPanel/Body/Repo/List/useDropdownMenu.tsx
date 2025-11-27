import { Icon, type MenuProps } from '@lobehub/ui';
import { App } from 'antd';
import { PencilLine, Trash } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

interface RepoItemDropdownMenuProps {
  id: string;
  toggleEditing: (visible?: boolean) => void;
}

export const useRepoItemDropdownMenu = ({
  id,
  toggleEditing,
}: RepoItemDropdownMenuProps): MenuProps['items'] => {
  const { t } = useTranslation(['file', 'common']);
  const [removeKnowledgeBase] = useKnowledgeBaseStore((s) => [s.removeKnowledgeBase]);
  const { modal } = App.useApp();

  return useMemo<MenuProps['items']>(
    () => [
      {
        icon: <Icon icon={PencilLine} />,
        key: 'rename',
        label: t('rename', { ns: 'common' }),
        onClick: () => {
          toggleEditing(true);
        },
      },
      {
        type: 'divider',
      },
      {
        danger: true,
        icon: <Icon icon={Trash} />,
        key: 'delete',
        label: t('delete', { ns: 'common' }),
        onClick: () => {
          if (!id) return;
          modal.confirm({
            centered: true,
            okButtonProps: { danger: true },
            onOk: async () => {
              await removeKnowledgeBase(id);
            },
            title: t('knowledgeBase.list.confirmRemoveKnowledgeBase'),
          });
        },
      },
    ],
    [t, id, modal, removeKnowledgeBase, toggleEditing],
  );
};
