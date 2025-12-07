import { ActionIcon, Dropdown, Tag } from '@lobehub/ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  AlertCircle,
  BookOpen,
  CircleDot,
  Code2,
  Heart,
  MoreHorizontal,
  Pencil,
  Settings,
  Trash2,
  Utensils,
} from 'lucide-react';
import { KeyboardEvent, MouseEvent, ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import MasonryCard from '@/app/[variants]/(main)/memory/features/MasonryView/MasonryCard';
import ProgressIcon from '@/app/[variants]/(main)/memory/features/ProgressIcon';
import SourceLink from '@/app/[variants]/(main)/memory/features/SourceLink';
import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';

dayjs.extend(relativeTime);

const getTypeIcon = (type: string): ReactNode => {
  const iconMap: Record<string, ReactNode> = {
    communication: <CircleDot size={14} />,
    dietary: <Utensils size={14} />,
    health: <Heart size={14} />,
    learning: <BookOpen size={14} />,
    lifestyle: <Settings size={14} />,
    security: <AlertCircle size={14} />,
    technology: <Code2 size={14} />,
  };
  return iconMap[type] || null;
};

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
    <MasonryCard
      actions={
        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
          <ActionIcon icon={MoreHorizontal} size="small" />
        </Dropdown>
      }
      badges={
        <ProgressIcon
          format={(percent) => `Priority: ${percent}%`}
          percent={preference.scorePriority}
        />
      }
      cate={
        preference.type && (
          <Tag icon={getTypeIcon(preference.type)} variant="filled">
            {preference.type}
          </Tag>
        )
      }
      footer={<SourceLink source={preference.source} />}
      onClick={onClick}
      title={preference.title}
      updatedAt={preference.updatedAt || preference.createdAt}
    >
      {preference.conclusionDirectives}
    </MasonryCard>
  );
});

export default PreferenceCard;
