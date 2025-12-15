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

interface ContextsListProps {
  isLoading?: boolean;
  searchValue?: string;
  viewMode: ViewMode;
}

const ContextsList = memo<ContextsListProps>(({ isLoading, searchValue, viewMode }) => {
  const { t } = useTranslation(['memory', 'common']);
  const { modal } = App.useApp();
  const toggleRightPanel = useGlobalStore((s) => s.toggleRightPanel);
  const [, setContextId] = useQueryState('contextId', { clearOnDefault: true });

  const contexts = useUserMemoryStore((s) => s.contexts);
  const deleteContext = useUserMemoryStore((s) => s.deleteContext);

  const handleCardClick = (context: any) => {
    setContextId(context.id);
    toggleRightPanel(true);
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      cancelText: t('cancel', { ns: 'common' }),
      content: t('context.deleteConfirm'),
      okButtonProps: { danger: true },
      okText: t('confirm', { ns: 'common' }),
      onOk: async () => {
        await deleteContext(id);
      },
      title: t('context.deleteTitle'),
      type: 'warning',
    });
  };

  const isEmpty = contexts.length === 0;

  if (isEmpty) {
    return <MemoryEmpty search={Boolean(searchValue)} title={t('context.empty')} />;
  }

  return viewMode === 'timeline' ? (
    <TimelineView
      contexts={contexts}
      isLoading={isLoading}
      onClick={handleCardClick}
      onDelete={handleDelete}
    />
  ) : (
    <MasonryView
      contexts={contexts}
      isLoading={isLoading}
      onClick={handleCardClick}
      onDelete={handleDelete}
    />
  );
});

export default ContextsList;
