import * as stylex from '@stylexjs/stylex';
import { memo, useMemo } from 'react';

import { activitiesOf, relatedOf, splitTimeline } from '../derive';
import { useEntityDemoStore } from '../store';
import { type MemoryEntity } from '../types';
import Header from './Header';
import MergeHint from './MergeHint';
import NowSection from './NowSection';
import Related from './Related';
import Timeline from './Timeline';

const styles = stylex.create({
  scroll: { flex: '1', height: '100%', minWidth: 0, overflowY: 'auto' },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    marginInline: 'auto',
    maxWidth: '720px',
    paddingBlockEnd: '96px',
    paddingBlockStart: '40px',
    paddingInline: '48px',
  },
  lead: { display: 'flex', flexDirection: 'column', gap: '20px' },
});

interface EntityPageProps {
  entity: MemoryEntity;
}

/**
 * One column in decision order: what it is → how it is now → what is next → how it got here →
 * what else it touches. Contexts and people share this page; only the header differs.
 */
const EntityPage = memo<EntityPageProps>(({ entity }) => {
  const entities = useEntityDemoStore((s) => s.entities);
  const activities = useEntityDemoStore((s) => s.activities);

  const { past, upcoming } = useMemo(
    () => splitTimeline(activitiesOf(activities, entity.id)),
    [activities, entity.id],
  );
  const related = useMemo(
    () => relatedOf(entities, activities, entity.id),
    [entities, activities, entity.id],
  );

  return (
    // Keyed by page so following a link starts at the top with no half-finished edit.
    <main aria-label={entity.title} key={entity.id} {...stylex.props(styles.scroll)}>
      <div {...stylex.props(styles.column)}>
        <div {...stylex.props(styles.lead)}>
          <Header entity={entity} />
          <MergeHint entityId={entity.id} />
        </div>
        <NowSection entity={entity} />
        <Timeline pageId={entity.id} past={past} upcoming={upcoming} />
        <Related items={related} />
      </div>
    </main>
  );
});

EntityPage.displayName = 'EntityPage';

export default EntityPage;
