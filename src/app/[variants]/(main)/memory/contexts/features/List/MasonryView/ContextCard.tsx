import { ActionIcon, Dropdown } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { KeyboardEvent, MouseEvent, memo } from 'react';
import { useTranslation } from 'react-i18next';

import MasonryCard from '@/app/[variants]/(main)/memory/features/GridView/MasonryCard';
import ProgressIcon from '@/app/[variants]/(main)/memory/features/ProgressIcon';
import SourceLink from '@/app/[variants]/(main)/memory/features/SourceLink';
import { DisplayContextMemory } from '@/database/repositories/userMemory';

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
      cate={context.type}
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
