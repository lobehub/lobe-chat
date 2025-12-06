'use client';

import { Grid } from '@lobehub/ui';
import { Empty } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserMemoryStore } from '@/store/userMemory';

import PreferenceCard from './PreferenceCard';
import PreferenceTimelineView from './PreferenceTimelineView';
import ViewModeSwitcher, { ViewMode } from './ViewModeSwitcher';

const PreferencesList = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('memory');
  const { data: preferences, isLoading } = useUserMemoryStore((s) => s.useFetchPreferences());
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');

  if (isLoading) return <div>{t('loading')}</div>;

  if (!preferences || preferences.length === 0) {
    return <Empty description={t('preference.empty')} />;
  }

  return (
    <Flexbox gap={16}>
      <Flexbox horizontal justify="flex-end">
        <ViewModeSwitcher onChange={setViewMode} value={viewMode} />
      </Flexbox>

      {viewMode === 'timeline' ? (
        <PreferenceTimelineView preferences={preferences} />
      ) : (
        <Grid gap={16} rows={mobile ? 1 : 3}>
          {preferences.map((preference) => (
            <PreferenceCard key={preference.id} preference={preference} />
          ))}
        </Grid>
      )}
    </Flexbox>
  );
});

export default PreferencesList;
