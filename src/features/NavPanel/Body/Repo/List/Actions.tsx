import { ActionIcon, Dropdown, Icon, type MenuProps } from '@lobehub/ui';
import { App } from 'antd';
import { MoreHorizontalIcon, PencilLine, Trash } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

interface RepoItemProps {
  id: string;
  toggleEditing: (visible?: boolean) => void;
}

const Actions = memo<RepoItemProps>(({ id, toggleEditing }) => {
  const { t } = useTranslation(['file', 'common']);
  const [removeKnowledgeBase] = useKnowledgeBaseStore((s) => [s.removeKnowledgeBase]);
  const { modal } = App.useApp();

  const items = useMemo<MenuProps['items']>(
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
    [t, id, modal, removeKnowledgeBase],
  );

  return (
    <Dropdown
      arrow={false}
      menu={{
        items: items,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
        },
      }}
      trigger={['click']}
    >
      <ActionIcon icon={MoreHorizontalIcon} size={'small'} />
    </Dropdown>
  );
});

export default Actions;
