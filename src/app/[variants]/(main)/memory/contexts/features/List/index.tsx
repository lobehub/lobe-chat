import { Empty } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DisplayContextMemory } from '@/database/repositories/userMemory';

import { ViewMode } from '../../../features/ViewModeSwitcher';
import ContextDrawer from './ContextDrawer';
import MasonryView from './MasonryView';
import TimelineView from './TimelineView';

interface ContextsListProps {
  data: DisplayContextMemory[];
  viewMode: ViewMode;
}

const ContextsList = memo<ContextsListProps>(({ data, viewMode }) => {
  const { t } = useTranslation('memory');
  const [selectedContext, setSelectedContext] = useState<DisplayContextMemory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCardClick = (context: DisplayContextMemory) => {
    setSelectedContext(context);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  if (!data || data.length === 0) return <Empty description={t('context.empty')} />;

  return (
    <>
      {viewMode === 'timeline' ? (
        <TimelineView contexts={data} onClick={handleCardClick} />
      ) : (
        <MasonryView contexts={data} onClick={handleCardClick} />
      )}

      <ContextDrawer context={selectedContext} onClose={handleDrawerClose} open={drawerOpen} />
    </>
  );
});

export default ContextsList;
