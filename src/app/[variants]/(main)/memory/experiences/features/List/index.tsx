import { App } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import MemoryEmpty from '@/app/[variants]/(main)/memory/features/MemoryEmpty';
import { useQueryState } from '@/hooks/useQueryParam';
import { useGlobalStore } from '@/store/global';
import { useUserMemoryStore } from '@/store/userMemory';

import { ViewMode } from '../../../features/ViewModeSwitcher';
import MasonryView from './MasonryView';
import TimelineView from './TimelineView';

interface ExperiencesListProps {
  isLoading?: boolean;
  searchValue?: string;
  viewMode: ViewMode;
}

const ExperiencesList = memo<ExperiencesListProps>(({ isLoading, searchValue, viewMode }) => {
  const { t } = useTranslation(['memory', 'common']);
  const { modal } = App.useApp();
  const [, setExperienceId] = useQueryState('experienceId', { clearOnDefault: true });
  const toggleRightPanel = useGlobalStore((s) => s.toggleRightPanel);
  const experiences = useUserMemoryStore((s) => s.experiences);
  const deleteExperience = useUserMemoryStore((s) => s.deleteExperience);

  const handleCardClick = (experience: any) => {
    setExperienceId(experience.id);
    toggleRightPanel(true);
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      cancelText: t('cancel', { ns: 'common' }),
      content: t('experience.deleteConfirm'),
      okButtonProps: { danger: true },
      okText: t('confirm', { ns: 'common' }),
      onOk: async () => {
        await deleteExperience(id);
      },
      title: t('experience.deleteTitle'),
      type: 'warning',
    });
  };

  const isEmpty = experiences.length === 0;

  if (isEmpty) {
    return <MemoryEmpty search={Boolean(searchValue)} title={t('experience.empty')} />;
  }

  return viewMode === 'timeline' ? (
    <TimelineView
      experiences={experiences}
      isLoading={isLoading}
      onCardClick={handleCardClick}
      onDelete={handleDelete}
    />
  ) : (
    <MasonryView
      experiences={experiences}
      isLoading={isLoading}
      onClick={handleCardClick}
      onDelete={handleDelete}
    />
  );
});

export default ExperiencesList;
