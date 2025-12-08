import { App, Empty } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';
import { useUserMemoryStore } from '@/store/userMemory';

import { ViewMode } from '../../../features/ViewModeSwitcher';
import ExperienceDrawer from './ExperienceDrawer';
import MasonryView from './MasonryView';
import TimelineView from './TimelineView';

interface ExperiencesListProps {
  data: DisplayExperienceMemory[];
  viewMode: ViewMode;
}

const ExperiencesList = memo<ExperiencesListProps>(({ data, viewMode }) => {
  const { t } = useTranslation(['memory', 'common']);
  const { modal } = App.useApp();
  const [selectedExperience, setSelectedExperience] = useState<DisplayExperienceMemory | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const deleteExperience = useUserMemoryStore((s) => s.deleteExperience);

  const handleCardClick = (experience: DisplayExperienceMemory) => {
    setSelectedExperience(experience);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
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

  if (!data || data.length === 0) return <Empty description={t('experience.empty')} />;

  return (
    <>
      {viewMode === 'timeline' ? (
        <TimelineView experiences={data} onCardClick={handleCardClick} onDelete={handleDelete} />
      ) : (
        <MasonryView experiences={data} onClick={handleCardClick} onDelete={handleDelete} />
      )}

      <ExperienceDrawer
        experience={selectedExperience}
        onClose={handleDrawerClose}
        open={drawerOpen}
      />
    </>
  );
});

export default ExperiencesList;
