import { App, Empty } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DisplayContextMemory } from '@/database/repositories/userMemory';
import { useUserMemoryStore } from '@/store/userMemory';

import { ViewMode } from '../../../features/ViewModeSwitcher';
import ContextDrawer from './ContextDrawer';
import MasonryView from './MasonryView';
import TimelineView from './TimelineView';

interface ContextsListProps {
  data: DisplayContextMemory[];
  viewMode: ViewMode;
}

const ContextsList = memo<ContextsListProps>(({ data, viewMode }) => {
  const { t } = useTranslation(['memory', 'common']);
  const { modal } = App.useApp();
  const [selectedContext, setSelectedContext] = useState<DisplayContextMemory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const deleteContext = useUserMemoryStore((s) => s.deleteContext);

  const handleCardClick = (context: DisplayContextMemory) => {
    setSelectedContext(context);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
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

  if (!data || data.length === 0) return <Empty description={t('context.empty')} />;

  return (
    <>
      {viewMode === 'timeline' ? (
        <TimelineView contexts={data} onClick={handleCardClick} onDelete={handleDelete} />
      ) : (
        <MasonryView contexts={data} onClick={handleCardClick} onDelete={handleDelete} />
      )}

      <ContextDrawer context={selectedContext} onClose={handleDrawerClose} open={drawerOpen} />
    </>
  );
});

export default ContextsList;
