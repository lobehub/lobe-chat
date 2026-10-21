'use client';

import { Center, Empty, toast } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { LayersIcon } from 'lucide-react';
import { memo } from 'react';

import DemoStateBar from './DemoStateBar';
import EntityList from './EntityList';
import EntityPage from './EntityPage';
import { ErrorState, FirstRunState, LoadingState } from './states';
import { useEntityDemoStore } from './store';

const styles = stylex.create({
  root: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%' },
  body: { display: 'flex', flex: '1', minHeight: 0 },
});

/**
 * Memory → 情境, redesigned as entity pages: every project, event, thing, place and
 * organisation is one page, and activities are the timeline that links them (people open with
 * the same page). Runs on mock data; the state bar in the corner previews empty / loading /
 * error.
 */
const MemoryEntities = memo(() => {
  const demoState = useEntityDemoStore((s) => s.demoState);
  const setDemoState = useEntityDemoStore((s) => s.setDemoState);
  const entity = useEntityDemoStore((s) =>
    s.deletedIds.includes(s.selectedId ?? '')
      ? undefined
      : s.entities.find((e) => e.id === s.selectedId),
  );

  let content;
  switch (demoState) {
    case 'loading': {
      content = <LoadingState />;
      break;
    }
    case 'error': {
      content = <ErrorState onRetry={() => setDemoState('ready')} />;
      break;
    }
    case 'empty': {
      content = (
        <FirstRunState
          onAnalyze={() => {
            toast.info({ title: '已开始整理，完成后会出现在这里' });
            setDemoState('ready');
          }}
        />
      );
      break;
    }
    default: {
      content = (
        <>
          <EntityList />
          {entity ? (
            <EntityPage entity={entity} />
          ) : (
            <Center flex={1}>
              <Empty description={'从左侧选一个情境，或在「最近删除」里恢复'} icon={LayersIcon} />
            </Center>
          )}
        </>
      );
    }
  }

  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.body)}>{content}</div>
      <DemoStateBar />
    </div>
  );
});

MemoryEntities.displayName = 'MemoryEntities';

export default MemoryEntities;
