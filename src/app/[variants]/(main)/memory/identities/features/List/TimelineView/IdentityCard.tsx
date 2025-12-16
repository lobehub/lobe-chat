import { ActionIcon, Dropdown } from '@lobehub/ui';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { KeyboardEvent, MouseEvent, memo } from 'react';
import { useTranslation } from 'react-i18next';

import TimeLineCard from '@/app/[variants]/(main)/memory/features/TimeLineView/TimeLineCard';
import { DisplayIdentityMemory } from '@/database/repositories/userMemory';

interface IdentityCardProps {
  identity: DisplayIdentityMemory;
  onClick?: (identity: DisplayIdentityMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const IdentityCard = memo<IdentityCardProps>(({ identity, onDelete, onEdit, onClick }) => {
  const { t } = useTranslation('memory');

  const handleMenuClick = (info: { domEvent: MouseEvent | KeyboardEvent; key: string }) => {
    info.domEvent.stopPropagation();
    if (info.key === 'delete' && onDelete) {
      onDelete(identity.id);
    } else if (info.key === 'edit' && onEdit) {
      onEdit(identity.id);
    }
  };

  const menuItems = [
    {
      icon: <Pencil size={14} />,
      key: 'edit',
      label: t('experience.actions.edit'),
    },
    {
      danger: true,
      icon: <Trash2 size={14} />,
      key: 'delete',
      label: t('experience.actions.delete'),
    },
  ];

  return (
    <TimeLineCard
      actions={
        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
          <ActionIcon icon={MoreHorizontal} size="small" />
        </Dropdown>
      }
      cate={identity.type}
      hashTags={identity.tags}
      onClick={() => onClick?.(identity)}
      title={identity.role}
      updatedAt={identity.updatedAt || identity.createdAt}
    >
      {identity.description}
    </TimeLineCard>
  );
});

export default IdentityCard;
