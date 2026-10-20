import { ActionIcon, createStaticStyles, cssVar, Flexbox, Input, Text } from '@lobehub/ui';
import { PencilIcon } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';

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
  rename: css`
    opacity: 0;
    transition: opacity 150ms ease;

    &:focus-visible {
      opacity: 1;
    }

    .meeting-segment-row:hover & {
      opacity: 1;
    }
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

interface SpeakerNameProps {
  color?: string;
  name: string;
  /** Save a new name; absent when the speaker is unknown or the meeting is read-only. */
  onRename?: (name: string) => Promise<void>;
  renameLabel: string;
}

/** Speaker name with an inline rename, so a diarized "Speaker 2" can become a person. */
const SpeakerName = ({ color, name, onRename, renameLabel }: SpeakerNameProps) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  const save = async () => {
    setEditing(false);
    const next = value.trim();
    if (next && next !== name) await onRename?.(next);
  };

  if (editing)
    return (
      <Input
        autoFocus
        aria-label={renameLabel}
        size={'small'}
        style={{ width: 180 }}
        value={value}
        onBlur={() => void save()}
        onChange={(event) => setValue(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === 'Enter') void save();
          if (event.key === 'Escape') setEditing(false);
        }}
      />
    );

  return (
    <Flexbox horizontal align={'center'} gap={2}>
      <span className={styles.name} style={{ color: color ?? cssVar.colorTextSecondary }}>
        {name}
      </span>
      {onRename && (
        <ActionIcon
          className={styles.rename}
          icon={PencilIcon}
          size={'small'}
          title={renameLabel}
          onClick={(event) => {
            event.stopPropagation();
            setValue(name);
            setEditing(true);
          }}
        />
      )}
    </Flexbox>
  );
};

interface SegmentRowProps {
  active: boolean;
  onRenameSpeaker?: (speakerId: string, name: string) => Promise<void>;
  onSeek: (ms: number) => void;
  renameLabel: string;
  segment: TranscriptSegment;
  speaker?: SpeakerView;
  unknownSpeaker: string;
}

// Memoized: a meeting has hundreds of rows and playback re-renders the list
// several times a second, but only the rows whose `active` flips change.
const SegmentRow = memo<SegmentRowProps>(
  ({ active, onRenameSpeaker, onSeek, renameLabel, segment, speaker, unknownSpeaker }) => (
    <Flexbox
      aria-current={active ? 'true' : undefined}
      className={`meeting-segment-row ${active ? `${styles.row} ${styles.active}` : styles.row}`}
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
        <SpeakerName
          color={speaker?.color}
          name={speaker?.name ?? unknownSpeaker}
          renameLabel={renameLabel}
          onRename={
            segment.speakerId && onRenameSpeaker
              ? (name) => onRenameSpeaker(segment.speakerId!, name)
              : undefined
          }
        />
        <span className={styles.time}>{formatClock(segment.startMs)}</span>
      </Flexbox>
      <div className={`${styles.text} meeting-segment-text`}>{segment.text}</div>
    </Flexbox>
  ),
);

interface TranscriptProps {
  activeIndex: number;
  emptyText: string;
  /** Scroll the playing segment into view as playback moves on. */
  follow: boolean;
  /** Stable across renders, so memoized rows do not re-render on playback ticks. */
  onRenameSpeaker?: (speakerId: string, name: string) => Promise<void>;
  onSeek: (ms: number) => void;
  renameLabel: string;
  segments: TranscriptSegment[];
  speakers: Map<string, SpeakerView>;
  unknownSpeaker: string;
}

const Transcript = ({
  activeIndex,
  emptyText,
  follow,
  onRenameSpeaker,
  onSeek,
  renameLabel,
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
          renameLabel={renameLabel}
          segment={segment}
          speaker={segment.speakerId ? speakers.get(segment.speakerId) : undefined}
          unknownSpeaker={unknownSpeaker}
          onRenameSpeaker={onRenameSpeaker}
          onSeek={onSeek}
        />
      ))}
    </Flexbox>
  );
};

export default Transcript;
