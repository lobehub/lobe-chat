import { ActionIcon, Dropdown } from '@lobehub/ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { KeyboardEvent, MouseEvent, memo } from 'react';
import { useTranslation } from 'react-i18next';

import GridCard from '@/app/[variants]/(main)/memory/features/GridView/GridCard';
import ProgressIcon from '@/app/[variants]/(main)/memory/features/ProgressIcon';
import SourceLink from '@/app/[variants]/(main)/memory/features/SourceLink';
import { DisplayExperienceMemory } from '@/database/repositories/userMemory';

dayjs.extend(relativeTime);

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
    <GridCard
      actions={
        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
          <ActionIcon icon={MoreHorizontal} size="small" />
        </Dropdown>
      }
      badges={
        <ProgressIcon
          format={(percent) => `Confidence: ${percent}%`}
          percent={(experience.scoreConfidence ?? 0) * 100}
        />
      }
      cate={experience.type}
      footer={<SourceLink source={experience.source} />}
      onClick={() => onClick(experience)}
      title={experience.title}
      updatedAt={experience.updatedAt || experience.createdAt}
    >
      {experience.keyLearning || experience.situation}
    </GridCard>
  );
});

export default ExperienceCard;
