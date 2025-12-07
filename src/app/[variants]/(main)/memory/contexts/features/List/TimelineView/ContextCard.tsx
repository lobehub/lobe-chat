import { ActionIcon, Dropdown } from '@lobehub/ui';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { KeyboardEvent, MouseEvent, memo } from 'react';
import { useTranslation } from 'react-i18next';

import SourceLink from '@/app/[variants]/(main)/memory/features/SourceLink';
import TimeLineCard from '@/app/[variants]/(main)/memory/features/TimeLineView/TimeLineCard';
import { DisplayContextMemory } from '@/database/repositories/userMemory';

interface ContextCardProps {
  context: DisplayContextMemory;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ContextCard = memo<ContextCardProps>(({ context, onClick, onDelete, onEdit }) => {
  const { t } = useTranslation('memory');

  const handleMenuClick = (info: { domEvent: MouseEvent | KeyboardEvent; key: string }) => {
    info.domEvent.stopPropagation();
    if (info.key === 'delete' && onDelete) {
      onDelete(context.id);
    } else if (info.key === 'edit' && onEdit) {
      onEdit(context.id);
    }
  };

  const menuItems = [
    {
      icon: <Pencil size={14} />,
      key: 'edit',
      label: t('context.actions.edit'),
    },
    {
      danger: true,
      icon: <Trash2 size={14} />,
      key: 'delete',
      label: t('context.actions.delete'),
    },
  ];

  return (
    <TimeLineCard
      actions={
        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
          <ActionIcon icon={MoreHorizontal} size="small" />
        </Dropdown>
      }
      cate={context.type}
      hashTags={context.tags}
      onClick={onClick}
      title={context.title}
      titleAddon={<SourceLink source={context.source} />}
      updatedAt={context.updatedAt || context.createdAt}
    >
      {context.description}
    </TimeLineCard>
  );
});

export default ContextCard;
