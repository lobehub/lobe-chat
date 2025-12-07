import { ActionIcon, Dropdown, Tag } from '@lobehub/ui';
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

import SourceLink from '@/app/[variants]/(main)/memory/features/SourceLink';
import TimeLineCard from '@/app/[variants]/(main)/memory/features/TimeLineView/TimeLineCard';
import { DisplayExperienceMemory } from '@/database/repositories/userMemory';

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
    <TimeLineCard
      actions={
        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
          <ActionIcon icon={MoreHorizontal} size="small" />
        </Dropdown>
      }
      cate={experience.type && <Tag icon={getTypeIcon(experience.type)}>{experience.type}</Tag>}
      hashTags={experience.tags}
      onClick={() => onClick(experience)}
      title={experience.title}
      titleAddon={<SourceLink source={experience.source} />}
      updatedAt={experience.updatedAt || experience.createdAt}
    >
      {experience.situation}
    </TimeLineCard>
  );
});

export default ExperienceCard;
