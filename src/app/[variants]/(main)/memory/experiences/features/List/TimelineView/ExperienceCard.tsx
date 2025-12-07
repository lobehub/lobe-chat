import { ActionIcon, Dropdown } from '@lobehub/ui';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { KeyboardEvent, MouseEvent, memo } from 'react';
import { useTranslation } from 'react-i18next';

import SourceLink from '@/app/[variants]/(main)/memory/features/SourceLink';
import TimeLineCard from '@/app/[variants]/(main)/memory/features/TimeLineView/TimeLineCard';
import { DisplayExperienceMemory } from '@/database/repositories/userMemory';

interface ExperienceCardProps {
  experience: DisplayExperienceMemory;
  onClick: (experience: DisplayExperienceMemory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ExperienceCard = memo<ExperienceCardProps>(({ experience, onClick, onDelete, onEdit }) => {
  const { t } = useTranslation('memory');

  const handleMenuClick = (info: { domEvent: MouseEvent | KeyboardEvent; key: string }) => {
    info.domEvent.stopPropagation();
    if (info.key === 'delete' && onDelete) {
      onDelete(experience.id);
    } else if (info.key === 'edit' && onEdit) {
      onEdit(experience.id);
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
      cate={experience.type}
      hashTags={experience.tags}
      onClick={() => onClick(experience)}
      title={experience.title}
      titleAddon={<SourceLink source={experience.source} />}
      updatedAt={experience.updatedAt || experience.createdAt}
    >
      {experience.keyLearning || experience.situation}
    </TimeLineCard>
  );
});

export default ExperienceCard;
