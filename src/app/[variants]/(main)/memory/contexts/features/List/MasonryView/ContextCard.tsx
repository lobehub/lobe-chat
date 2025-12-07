import { ActionIcon, Dropdown, Tag } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  AlertTriangle,
  Briefcase,
  CircleDot,
  Globe,
  MoreHorizontal,
  Pencil,
  Target,
  Trash2,
  Users,
} from 'lucide-react';
import { KeyboardEvent, MouseEvent, ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import MasonryCard from '@/app/[variants]/(main)/memory/features/MasonryView/MasonryCard';
import ProgressIcon from '@/app/[variants]/(main)/memory/features/ProgressIcon';
import SourceLink from '@/app/[variants]/(main)/memory/features/SourceLink';
import { DisplayContextMemory } from '@/database/repositories/userMemory';

dayjs.extend(relativeTime);

const getTypeIcon = (type: string | null): ReactNode => {
  const iconSize = 14;
  switch (type?.toLowerCase()) {
    case 'goal': {
      return <Target size={iconSize} />;
    }
    case 'problem': {
      return <AlertTriangle size={iconSize} />;
    }
    case 'project': {
      return <Briefcase size={iconSize} />;
    }
    case 'relationship': {
      return <Users size={iconSize} />;
    }
    case 'situation': {
      return <Globe size={iconSize} />;
    }
    default: {
      return <CircleDot size={iconSize} />;
    }
  }
};

interface ContextCardProps {
  context: DisplayContextMemory;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const ContextCard = memo<ContextCardProps>(({ context, onClick, onDelete, onEdit }) => {
  const { t } = useTranslation('memory');
  const theme = useTheme();

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
    <MasonryCard
      actions={
        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
          <ActionIcon icon={MoreHorizontal} size="small" />
        </Dropdown>
      }
      badges={
        <>
          <ProgressIcon
            format={(percent) => `Impact: ${percent}%`}
            percent={(context.scoreImpact ?? 0) * 100}
          />
          <ProgressIcon
            format={(percent) => `Urgency: ${percent}%`}
            percent={(context.scoreUrgency ?? 0) * 100}
            strokeColor={(context.scoreUrgency ?? 0) >= 0.7 ? theme.colorError : theme.colorWarning}
          />
        </>
      }
      cate={
        context.type && (
          <Tag icon={getTypeIcon(context.type)} variant="filled">
            {context.type}
          </Tag>
        )
      }
      footer={<SourceLink source={context.source} />}
      onClick={onClick}
      title={context.title}
      updatedAt={context.updatedAt || context.createdAt}
    >
      {context.description}
    </MasonryCard>
  );
});

export default ContextCard;
