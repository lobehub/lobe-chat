import { App, Empty } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';
import { useUserMemoryStore } from '@/store/userMemory';

import { ViewMode } from '../../../features/ViewModeSwitcher';
import MasonryView from './MasonryView';
import PreferenceDrawer from './PreferenceDrawer';
import TimelineView from './TimelineView';

interface PreferencesListProps {
  data: DisplayPreferenceMemory[];
  viewMode: ViewMode;
}

const PreferencesList = memo<PreferencesListProps>(({ data, viewMode }) => {
  const { t } = useTranslation(['memory', 'common']);
  const { modal } = App.useApp();
  const [selectedPreference, setSelectedPreference] = useState<DisplayPreferenceMemory | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const deletePreference = useUserMemoryStore((s) => s.deletePreference);

  const handleCardClick = (preference: DisplayPreferenceMemory) => {
    setSelectedPreference(preference);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      cancelText: t('cancel', { ns: 'common' }),
      content: t('preference.deleteConfirm'),
      okButtonProps: { danger: true },
      okText: t('confirm', { ns: 'common' }),
      onOk: async () => {
        await deletePreference(id);
      },
      title: t('preference.deleteTitle'),
      type: 'warning',
    });
  };

  if (!data || data.length === 0) return <Empty description={t('preference.empty')} />;

  return (
    <>
      {viewMode === 'timeline' ? (
        <TimelineView onClick={handleCardClick} onDelete={handleDelete} preferences={data} />
      ) : (
        <MasonryView onClick={handleCardClick} onDelete={handleDelete} preferences={data} />
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
