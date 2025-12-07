import { Empty } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';

import { ViewMode } from '../../../features/ViewModeSwitcher';
import ExperienceDrawer from './ExperienceDrawer';
import MasonryView from './MasonryView';
import TimelineView from './TimelineView';

interface ExperiencesListProps {
  data: DisplayExperienceMemory[];
  viewMode: ViewMode;
}

const ExperiencesList = memo<ExperiencesListProps>(({ data, viewMode }) => {
  const { t } = useTranslation('memory');
  const [selectedExperience, setSelectedExperience] = useState<DisplayExperienceMemory | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCardClick = (experience: DisplayExperienceMemory) => {
    setSelectedExperience(experience);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  if (!data || data.length === 0) return <Empty description={t('experience.empty')} />;

  return (
    <>
      {viewMode === 'timeline' ? (
        <TimelineView experiences={data} onCardClick={handleCardClick} />
      ) : (
        <MasonryView experiences={data} onClick={handleCardClick} />
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
