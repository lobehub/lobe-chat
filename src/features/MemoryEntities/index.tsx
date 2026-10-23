'use client';

import { Center, Empty } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { LayersIcon } from 'lucide-react';
import { memo, useEffect, useMemo } from 'react';

import { EntityDataContext } from './context';
import { lastTouchedOf } from './derive';
import EntityList from './EntityList';
import EntityPage from './EntityPage';
import { ErrorState, FirstRunState, LoadingState } from './states';
import { useEntityData } from './useEntityData';
import { useSelection } from './useSelection';

const styles = stylex.create({
  root: { display: 'flex', height: '100%', width: '100%' },
});

/**
 * Memory → 情境 as entity pages: every context is one page, and the activities that mention
 * the same names form its timeline (the backend stores no direct link).
 */
const MemoryEntities = memo(() => {
  const data = useEntityData();
  const { selectedId } = useSelection();
  const { ensureContext, entities, isLoading } = data;

  // A deep link (e.g. "open in memory" from a chat) may point past the loaded pages.
  useEffect(() => {
    if (isLoading || !selectedId || entities.some((e) => e.id === selectedId)) return;
    ensureContext(selectedId).catch(() => undefined);
  }, [ensureContext, entities, isLoading, selectedId]);

  // Nothing picked yet (or the pick was deleted): open the page that moved most recently.
  const entity = useMemo(() => {
    const picked = data.entities.find((e) => e.id === selectedId);
    if (picked) return picked;
    return data.entities
      .filter((e) => e.status === 'active')
      .sort((a, b) => lastTouchedOf(b, data.links).localeCompare(lastTouchedOf(a, data.links)))[0];
  }, [data.entities, data.links, selectedId]);

  let content;
  if (data.isLoading) content = <LoadingState />;
  else if (data.error && data.entities.length === 0)
    content = <ErrorState onRetry={data.retry} />;
  else if (data.entities.length === 0) content = <FirstRunState />;
  else
    content = (
      <>
        <EntityList />
        {entity ? (
          <EntityPage entity={entity} />
        ) : (
          <Center flex={1}>
            <Empty description={'从左侧选一个情境'} icon={LayersIcon} />
          </Center>
        )}
      </>
    );

  return (
    <EntityDataContext value={data}>
      <div {...stylex.props(styles.root)}>{content}</div>
    </EntityDataContext>
  );
});

MemoryEntities.displayName = 'MemoryEntities';

export default MemoryEntities;
