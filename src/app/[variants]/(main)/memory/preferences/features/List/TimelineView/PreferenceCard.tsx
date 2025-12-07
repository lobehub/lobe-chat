import { ActionIcon, Dropdown } from '@lobehub/ui';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { KeyboardEvent, MouseEvent, memo } from 'react';
import { useTranslation } from 'react-i18next';

import SourceLink from '@/app/[variants]/(main)/memory/features/SourceLink';
import TimeLineCard from '@/app/[variants]/(main)/memory/features/TimeLineView/TimeLineCard';
import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';

interface PreferenceCardProps {
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  preference: DisplayPreferenceMemory;
}

const PreferenceCard = memo<PreferenceCardProps>(({ preference, onClick, onDelete, onEdit }) => {
  const { t } = useTranslation('memory');

  const handleMenuClick = (info: { domEvent: MouseEvent | KeyboardEvent; key: string }) => {
    info.domEvent.stopPropagation();
    if (info.key === 'delete' && onDelete) {
      onDelete(preference.id);
    } else if (info.key === 'edit' && onEdit) {
      onEdit(preference.id);
    }
  };

  const menuItems = [
    {
      icon: <Pencil size={14} />,
      key: 'edit',
      label: t('preference.actions.edit'),
    },
    {
      danger: true,
      icon: <Trash2 size={14} />,
      key: 'delete',
      label: t('preference.actions.delete'),
    },
  ];

  return (
    <TimeLineCard
      actions={
        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
          <ActionIcon icon={MoreHorizontal} size="small" />
        </Dropdown>
      }
      cate={preference.type}
      hashTags={preference.tags}
      onClick={onClick}
      title={preference.title}
      titleAddon={<SourceLink source={preference.source} />}
      updatedAt={preference.updatedAt || preference.createdAt}
    >
      {preference.conclusionDirectives}
    </TimeLineCard>
  );
});

export default PreferenceCard;
