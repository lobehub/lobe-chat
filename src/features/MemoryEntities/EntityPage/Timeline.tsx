import { Button } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo, useState } from 'react';

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
  empty: { color: cssVar.colorTextTertiary, fontSize: '13px', lineHeight: '20px', margin: 0 },
  more: { alignSelf: 'flex-start' },
});

/** Long timelines show the most recent entries first and expand on request. */
const PAST_PREVIEW = 12;

type Entry = { activity: MemoryActivity; names: string[] };

interface TimelineProps {
  entries: Entry[];
}

/**
 * Activities are not linked to contexts in the backend; these are the ones that mention a name
 * this page mentions. The header says so, and each entry shows which name matched.
 */
const Timeline = memo<TimelineProps>(({ entries }) => {
  const [expanded, setExpanded] = useState(false);
  const upcoming = entries.filter((e) => e.activity.planned);
  const past = entries.filter((e) => !e.activity.planned);
  const shown = expanded ? past : past.slice(0, PAST_PREVIEW);

  return (
    <>
      {upcoming.length > 0 && (
        <Section title={'接下来'}>
          <div {...stylex.props(styles.list)}>
            {upcoming.map(({ activity, names }) => (
              <TimelineEntry upcoming activity={activity} key={activity.id} matched={names} />
            ))}
          </div>
        </Section>
      )}
      <Section
        extra={past.length > 0 ? `${past.length} 条 · 按提到的名字关联，可能不全` : undefined}
        title={'经过'}
      >
        {past.length === 0 ? (
          <p {...stylex.props(styles.empty)}>
            还没有活动提到这里的人和事物。活动和情境之间目前只能按名字关联，所以这里可能是空的。
          </p>
        ) : (
          <div {...stylex.props(styles.list)}>
            {groupByMonth(shown).map((group) => (
              <div key={group.label} {...stylex.props(styles.month)}>
                <div {...stylex.props(styles.monthLabel)}>{group.label}</div>
                {group.entries.map(({ activity, names }) => (
                  <TimelineEntry activity={activity} key={activity.id} matched={names} />
                ))}
              </div>
            ))}
            {past.length > shown.length && (
              <Button
                size={'small'}
                type={'text'}
                {...stylex.props(styles.more)}
                onClick={() => setExpanded(true)}
              >
                显示全部 {past.length} 条
              </Button>
            )}
          </div>
        )}
      </Section>
    </>
  );
});

Timeline.displayName = 'EntityTimeline';

export default Timeline;
