import { ActionIcon, Dropdown, Tag } from '@lobehub/ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Calendar,
  CircleDot,
  Cpu,
  FileText,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Settings,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import { KeyboardEvent, MouseEvent, ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import MasonryCard from '@/app/[variants]/(main)/memory/features/MasonryView/MasonryCard';
import ProgressIcon from '@/app/[variants]/(main)/memory/features/ProgressIcon';
import SourceLink from '@/app/[variants]/(main)/memory/features/SourceLink';
import { DisplayExperienceMemory } from '@/database/repositories/userMemory';

dayjs.extend(relativeTime);

const getTypeIcon = (type: string): ReactNode => {
  const iconMap: Record<string, ReactNode> = {
    accomplishment: <Sparkles size={14} />,
    activity: <Zap size={14} />,
    conversation: <MessageSquare size={14} />,
    decision: <Settings size={14} />,
    event: <Calendar size={14} />,
    fact: <FileText size={14} />,
    interaction: <Users size={14} />,
    location: <MapPin size={14} />,
    observation: <CircleDot size={14} />,
    skill: <Cpu size={14} />,
  };
  return iconMap[type] || null;
};

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
    <MasonryCard
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
      cate={
        experience.type && (
          <Tag icon={getTypeIcon(experience.type)} variant="filled">
            {experience.type}
          </Tag>
        )
      }
      footer={<SourceLink source={experience.source} />}
      onClick={() => onClick(experience)}
      title={experience.title}
      updatedAt={experience.updatedAt || experience.createdAt}
    >
      {experience.keyLearning || experience.situation}
    </MasonryCard>
  );
});

export default ExperienceCard;
