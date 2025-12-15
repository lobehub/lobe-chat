import { Empty } from '@lobehub/ui';
import { App } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryState } from '@/hooks/useQueryParam';
import { useGlobalStore } from '@/store/global';
import { useUserMemoryStore } from '@/store/userMemory';

import { ViewMode } from '../../../features/ViewModeSwitcher';
import MasonryView from './MasonryView';
import TimelineView from './TimelineView';

interface ExperiencesListProps {
  viewMode: ViewMode;
}

const ExperiencesList = memo<ExperiencesListProps>(({ viewMode }) => {
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

  if (!experiences || experiences.length === 0)
    return <Empty description={t('experience.empty')} />;

  return viewMode === 'timeline' ? (
    <TimelineView experiences={experiences} onCardClick={handleCardClick} onDelete={handleDelete} />
  ) : (
    <MasonryView experiences={experiences} onClick={handleCardClick} onDelete={handleDelete} />
  );
});

export default ExperiencesList;
