'use client';

import { createStaticStyles, cssVar, Flexbox, Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatOffset, speakerIndex } from './format';

export interface SegmentListItem {
  endMs: number;
  /** Stored row id; live segments fall back to their `seq`. */
  id?: string;
  seq: number;
  speaker?: string | null;
  startMs: number;
  text: string;
}

const SPEAKER_COLORS = [
  cssVar.colorPrimary,
  cssVar.colorSuccess,
  cssVar.colorWarning,
  cssVar.colorInfo,
  cssVar.colorError,
];

const styles = createStaticStyles(({ css, cssVar }) => ({
  row: css`
    padding-block: 6px;
  `,
  speaker: css`
    font-size: 12px;
    font-weight: 600;
  `,
  text: css`
    font-size: 14px;
    line-height: 1.7;
    color: ${cssVar.colorText};
    word-break: break-word;
  `,
  time: css`
    font-family: ${cssVar.fontFamilyCode};
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: ${cssVar.colorTextTertiary};
  `,
}));

interface SegmentListProps {
  /** Jump playback to a segment; makes its timestamp clickable. */
  onSeek?: (ms: number) => void;
  segments: SegmentListItem[];
  /** In-progress text after the last segment, shown muted. */
  tail?: string;
}

/** Timestamped transcript lines, with the speaker when diarization labelled one. */
const SegmentList = memo<SegmentListProps>(({ onSeek, segments, tail }) => {
  const { t } = useTranslation('meeting');

  return (
    <Flexbox gap={4}>
      {segments.map((segment) => {
        const index = speakerIndex(segment.speaker);
        const speaker =
          segment.speaker && (index ? t('transcript.speaker', { index }) : segment.speaker);
        return (
          <Flexbox
            className={styles.row}
            data-testid="meeting-segment"
            gap={2}
            key={segment.id ?? segment.seq}
          >
            <Flexbox horizontal align={'center'} gap={8}>
              {onSeek ? (
                <span
                  className={styles.time}
                  role={'button'}
                  style={{ cursor: 'pointer' }}
                  tabIndex={0}
                  onClick={() => onSeek(segment.startMs)}
                >
                  {formatOffset(segment.startMs)}
                </span>
              ) : (
                <span className={styles.time}>{formatOffset(segment.startMs)}</span>
              )}
              {speaker && (
                <span
                  className={styles.speaker}
                  style={{ color: SPEAKER_COLORS[((index ?? 1) - 1) % SPEAKER_COLORS.length] }}
                >
                  {speaker}
                </span>
              )}
            </Flexbox>
            <span className={styles.text}>{segment.text}</span>
          </Flexbox>
        );
      })}
      {tail ? (
        <Text className={styles.text} type={'secondary'}>
          {tail}
        </Text>
      ) : null}
    </Flexbox>
  );
});

SegmentList.displayName = 'MeetingSegmentList';

export default SegmentList;
