import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { Fragment, memo, type ReactNode } from 'react';

import { formatMonthDay, formatUntil, formatWeekday, isPerson } from '../derive';
import { type MemoryActivity } from '../types';
import EntityLink from './EntityLink';

const styles = stylex.create({
  row: { columnGap: '20px', display: 'grid', gridTemplateColumns: '64px 1fr' },
  date: {
    display: 'flex',
    flexDirection: 'column',
    fontVariantNumeric: 'tabular-nums',
    paddingBlockStart: '1px',
  },
  day: { fontSize: '16px', fontWeight: 600, lineHeight: '22px' },
  dayUpcoming: { fontSize: '14px' },
  sub: { color: cssVar.colorTextTertiary, fontSize: '12px', lineHeight: '18px' },
  body: { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 },
  narrative: { color: cssVar.colorText, fontSize: '14px', lineHeight: '22px', margin: 0 },
  meta: { color: cssVar.colorTextTertiary, fontSize: '12px', lineHeight: '20px' },
});

const joinNodes = (nodes: ReactNode[], separator: ReactNode) =>
  nodes.map((node, index) => (
    <Fragment key={index}>
      {index > 0 && separator}
      {node}
    </Fragment>
  ));

interface TimelineEntryProps {
  activity: MemoryActivity;
  /** The page being viewed; it is implied, so it is left out of the meta line. */
  pageId: string;
  upcoming?: boolean;
}

/**
 * One line of meta instead of tags: "和 陈老师 · 关于 西溪办公室 · 来自「口语课复盘」".
 * Every name in it opens that page.
 */
const TimelineEntry = memo<TimelineEntryProps>(({ activity, pageId, upcoming }) => {
  const others = activity.links.filter((link) => link.id !== pageId);
  const people = others.filter((link) => isPerson(link.kind));
  const contexts = others.filter((link) => !isPerson(link.kind));

  const parts: ReactNode[] = [];
  if (people.length > 0)
    parts.push(<>和 {joinNodes(people.map((p) => <EntityLink id={p.id} key={p.id} />), '、')}</>);
  if (contexts.length > 0)
    parts.push(
      <>关于 {joinNodes(contexts.map((c) => <EntityLink id={c.id} key={c.id} />), '、')}</>,
    );
  if (activity.source) parts.push(<>来自「{activity.source.title}」</>);

  const date = new Date(activity.startsAt);

  return (
    <div {...stylex.props(styles.row)}>
      <div {...stylex.props(styles.date)}>
        {upcoming ? (
          <>
            <span {...stylex.props(styles.day, styles.dayUpcoming)}>
              {formatMonthDay(activity.startsAt)}
            </span>
            <span {...stylex.props(styles.sub)}>{formatUntil(activity.startsAt)}</span>
          </>
        ) : (
          <>
            <span {...stylex.props(styles.day)}>{date.getDate()} 日</span>
            <span {...stylex.props(styles.sub)}>{formatWeekday(activity.startsAt)}</span>
          </>
        )}
      </div>
      <div {...stylex.props(styles.body)}>
        <p {...stylex.props(styles.narrative)}>{activity.narrative}</p>
        {parts.length > 0 && (
          <span {...stylex.props(styles.meta)}>{joinNodes(parts, ' · ')}</span>
        )}
      </div>
    </div>
  );
});

TimelineEntry.displayName = 'TimelineEntry';

export default TimelineEntry;
