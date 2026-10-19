import { createStaticStyles, cssVar, Flexbox, Text } from '@lobehub/ui';
import { memo, useEffect, useRef } from 'react';

import { formatClock } from '../format';
import type { SpeakerView } from './speakers';

const styles = createStaticStyles(({ css }) => ({
  active: css`
    background: ${cssVar.colorPrimaryBg};

    .meeting-segment-text {
      color: ${cssVar.colorText};
    }
  `,
  name: css`
    font-size: 13px;
    font-weight: 600;
  `,
  row: css`
    cursor: pointer;

    padding-block: 12px;
    padding-inline: 12px;
    border-radius: ${cssVar.borderRadiusLG};

    transition: background 150ms ease;

    &:hover {
      background: ${cssVar.colorFillQuaternary};
    }

    &:focus-visible {
      outline: 2px solid ${cssVar.colorPrimaryBorder};
      outline-offset: -2px;
    }
  `,
  text: css`
    font-size: 14px;
    line-height: 1.75;
    color: ${cssVar.colorTextSecondary};
    word-break: break-word;
  `,
  time: css`
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: ${cssVar.colorTextTertiary};
  `,
}));

export interface TranscriptSegment {
  endMs: number;
  id: string;
  speakerId: string | null;
  startMs: number;
  text: string;
}

interface SegmentRowProps {
  active: boolean;
  onSeek: (ms: number) => void;
  segment: TranscriptSegment;
  speaker?: SpeakerView;
  unknownSpeaker: string;
}

// Memoized: a meeting has hundreds of rows and playback re-renders the list
// several times a second, but only the rows whose `active` flips change.
const SegmentRow = memo<SegmentRowProps>(({ active, onSeek, segment, speaker, unknownSpeaker }) => (
  <Flexbox
    aria-current={active ? 'true' : undefined}
    className={active ? `${styles.row} ${styles.active}` : styles.row}
    data-segment-id={segment.id}
    gap={4}
    role={'button'}
    tabIndex={0}
    onClick={() => onSeek(segment.startMs)}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSeek(segment.startMs);
      }
    }}
  >
    <Flexbox horizontal align={'center'} gap={8}>
      <span className={styles.name} style={{ color: speaker?.color ?? cssVar.colorTextSecondary }}>
        {speaker?.name ?? unknownSpeaker}
      </span>
      <span className={styles.time}>{formatClock(segment.startMs)}</span>
    </Flexbox>
    <div className={`${styles.text} meeting-segment-text`}>{segment.text}</div>
  </Flexbox>
));

interface TranscriptProps {
  activeIndex: number;
  emptyText: string;
  /** Scroll the playing segment into view as playback moves on. */
  follow: boolean;
  onSeek: (ms: number) => void;
  segments: TranscriptSegment[];
  speakers: Map<string, SpeakerView>;
  unknownSpeaker: string;
}

const Transcript = ({
  activeIndex,
  emptyText,
  follow,
  onSeek,
  segments,
  speakers,
  unknownSpeaker,
}: TranscriptProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const activeId = activeIndex >= 0 ? segments[activeIndex]?.id : undefined;

  // Centered, not 'nearest': the transcript scrolls under a sticky header that
  // would otherwise cover the row being played.
  useEffect(() => {
    if (!follow || !activeId) return;
    listRef.current
      ?.querySelector(`[data-segment-id="${activeId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeId, follow]);

  if (segments.length === 0)
    return (
      <Text style={{ padding: 12 }} type={'secondary'}>
        {emptyText}
      </Text>
    );

  return (
    <Flexbox gap={2} ref={listRef}>
      {segments.map((segment, index) => (
        <SegmentRow
          active={index === activeIndex}
          key={segment.id}
          segment={segment}
          speaker={segment.speakerId ? speakers.get(segment.speakerId) : undefined}
          unknownSpeaker={unknownSpeaker}
          onSeek={onSeek}
        />
      ))}
    </Flexbox>
  );
};

export default Transcript;
