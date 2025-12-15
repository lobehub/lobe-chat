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

interface PreferencesListProps {
  viewMode: ViewMode;
}

const PreferencesList = memo<PreferencesListProps>(({ viewMode }) => {
  const { t } = useTranslation(['memory', 'common']);
  const { modal } = App.useApp();
  const [, setPreferenceId] = useQueryState('preferenceId', { clearOnDefault: true });
  const toggleRightPanel = useGlobalStore((s) => s.toggleRightPanel);
  const preferences = useUserMemoryStore((s) => s.preferences);
  const deletePreference = useUserMemoryStore((s) => s.deletePreference);

  const handleCardClick = (preference: any) => {
    setPreferenceId(preference.id);
    toggleRightPanel(true);
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

  if (!preferences || preferences.length === 0)
    return <MemoryEmpty description={t('preference.empty')} />;

  return viewMode === 'timeline' ? (
    <TimelineView onClick={handleCardClick} onDelete={handleDelete} preferences={preferences} />
  ) : (
    <MasonryView onClick={handleCardClick} onDelete={handleDelete} preferences={preferences} />
  );
});

export default PreferencesList;
