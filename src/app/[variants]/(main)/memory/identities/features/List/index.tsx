import { App } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryState } from '@/hooks/useQueryParam';
import { useGlobalStore } from '@/store/global';
import { useUserMemoryStore } from '@/store/userMemory';

import MemoryEmpty from '../../../features/MemoryEmpty';
import { ViewMode } from '../../../features/ViewModeSwitcher';
import MasonryView from './MasonryView';
import TimelineView from './TimelineView';

export type IdentityType = 'all' | 'demographic' | 'personal' | 'professional';

interface IdentitiesListProps {
  isLoading?: boolean;
  searchValue?: string;
  viewMode: ViewMode;
}

const IdentitiesList = memo<IdentitiesListProps>(({ isLoading, searchValue, viewMode }) => {
  const { t } = useTranslation(['memory', 'common']);
  const { modal } = App.useApp();
  const [, setIdentityId] = useQueryState('identityId', { clearOnDefault: true });
  const toggleRightPanel = useGlobalStore((s) => s.toggleRightPanel);
  const identities = useUserMemoryStore((s) => s.identities);
  const deleteIdentity = useUserMemoryStore((s) => s.deleteIdentity);

  const handleCardClick = (identity: any) => {
    setIdentityId(identity.id);
    toggleRightPanel(true);
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      cancelText: t('cancel', { ns: 'common' }),
      content: t('identity.list.deleteContent'),
      okButtonProps: { danger: true },
      okText: t('delete', { ns: 'common' }),
      onOk: async () => {
        await deleteIdentity(id);
      },
      title: t('identity.list.confirmDelete'),
      type: 'warning',
    });
  };

  if (!identities || identities.length === 0)
    return <MemoryEmpty search={Boolean(searchValue)} title={t('identity.empty')} />;

  if (viewMode === 'timeline')
    return (
      <TimelineView
        identities={identities}
        isLoading={isLoading}
        onClick={handleCardClick}
        onDelete={handleDelete}
      />
    );

  return (
    <MasonryView
      identities={identities}
      isLoading={isLoading}
      onClick={handleCardClick}
      onDelete={handleDelete}
    />
  );
});

export default IdentitiesList;
