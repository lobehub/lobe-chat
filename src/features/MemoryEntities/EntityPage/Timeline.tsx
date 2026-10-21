import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo } from 'react';

import { groupByMonth } from '../derive';
import { type MemoryActivity } from '../types';
import Section from './Section';
import TimelineEntry from './TimelineEntry';

const styles = stylex.create({
  list: { display: 'flex', flexDirection: 'column', gap: '20px' },
  month: { display: 'flex', flexDirection: 'column', gap: '16px' },
  monthLabel: {
    backgroundColor: cssVar.colorBgContainer,
    color: cssVar.colorTextTertiary,
    fontSize: '12px',
    fontWeight: 500,
    insetBlockStart: 0,
    paddingBlock: '6px',
    position: 'sticky',
    zIndex: 1,
  },
  empty: { color: cssVar.colorTextTertiary, fontSize: '13px', margin: 0 },
});

interface TimelineProps {
  pageId: string;
  past: MemoryActivity[];
  upcoming: MemoryActivity[];
}

const Timeline = memo<TimelineProps>(({ pageId, past, upcoming }) => (
  <>
    {upcoming.length > 0 && (
      <Section title={'接下来'}>
        <div {...stylex.props(styles.list)}>
          {upcoming.map((activity) => (
            <TimelineEntry upcoming activity={activity} key={activity.id} pageId={pageId} />
          ))}
        </div>
      </Section>
    )}
    <Section extra={past.length > 0 ? `${past.length} 条` : undefined} title={'经过'}>
      {past.length === 0 ? (
        <p {...stylex.props(styles.empty)}>
          还没有记下发生过的事。之后在对话里提到它，会自动出现在这里。
        </p>
      ) : (
        <div {...stylex.props(styles.list)}>
          {groupByMonth(past).map((group) => (
            <div key={group.label} {...stylex.props(styles.month)}>
              <div {...stylex.props(styles.monthLabel)}>{group.label}</div>
              {group.entries.map((activity) => (
                <TimelineEntry activity={activity} key={activity.id} pageId={pageId} />
              ))}
            </div>
          ))}
        </div>
      )}
    </Section>
  </>
));

Timeline.displayName = 'EntityTimeline';

export default Timeline;
