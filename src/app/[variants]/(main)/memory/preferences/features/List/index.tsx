import { Empty } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';

import { ViewMode } from '../../../features/ViewModeSwitcher';
import MasonryView from './MasonryView';
import PreferenceDrawer from './PreferenceDrawer';
import TimelineView from './TimelineView';

interface PreferencesListProps {
  data: DisplayPreferenceMemory[];
  viewMode: ViewMode;
}

const PreferencesList = memo<PreferencesListProps>(({ data, viewMode }) => {
  const { t } = useTranslation('memory');
  const [selectedPreference, setSelectedPreference] = useState<DisplayPreferenceMemory | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCardClick = (preference: DisplayPreferenceMemory) => {
    setSelectedPreference(preference);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  if (!data || data.length === 0) return <Empty description={t('preference.empty')} />;

  return (
    <>
      {viewMode === 'timeline' ? (
        <TimelineView onClick={handleCardClick} preferences={data} />
      ) : (
        <MasonryView onClick={handleCardClick} preferences={data} />
      )}

      <PreferenceDrawer
        onClose={handleDrawerClose}
        open={drawerOpen}
        preference={selectedPreference}
      />
    </>
  );
});

export default PreferencesList;
