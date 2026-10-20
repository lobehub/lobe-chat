import { createStaticStyles, cssVar, Flexbox, Text } from '@lobehub/ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useMeetingStore } from '@/store/meeting';

import { formatClock } from '../../format';

const styles = createStaticStyles(({ css }) => ({
  hint: css`
    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
  `,
  scroll: css`
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    gap: 8px;

    height: 168px;
    padding-block: 12px;
    padding-inline: 12px;
    border-radius: ${cssVar.borderRadius};

    background: ${cssVar.colorFillQuaternary};
  `,
  segment: css`
    font-size: 13px;
    line-height: 1.6;
    color: ${cssVar.colorText};
    word-break: break-word;
  `,
  time: css`
    margin-inline-end: 6px;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: ${cssVar.colorTextTertiary};
  `,
}));

/** The live draft while recording, following the newest line. */
const LiveTranscript = () => {
  const { t } = useTranslation('meeting');
  const segments = useMeetingStore((s) => s.recorder.segments);
  const live = useMeetingStore((s) => s.recorder.live);
  const pendingWindows = useMeetingStore((s) => s.recorder.pendingWindows);
  const paused = useMeetingStore((s) => s.recorder.phase === 'paused');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [segments.length]);

  const status =
    live === 'unavailable'
      ? t('live.unavailable')
      : live === 'lagging'
        ? t('live.lagging')
        : paused
          ? t('live.paused')
          : pendingWindows > 0
            ? t('live.pending')
            : undefined;

  return (
    <Flexbox gap={6}>
      <Flexbox horizontal align={'center'} justify={'space-between'}>
        <Text fontSize={12} type={'secondary'} weight={500}>
          {t('live.title')}
        </Text>
        {status && <span className={styles.hint}>{status}</span>}
      </Flexbox>
      <div aria-live={'polite'} className={styles.scroll} ref={scrollRef}>
        {segments.length === 0 ? (
          <span className={styles.hint}>
            {live === 'unavailable' ? t('live.unavailable') : t('live.empty')}
          </span>
        ) : (
          segments.map((segment) => (
            <div className={styles.segment} key={segment.seq}>
              <span className={styles.time}>{formatClock(segment.startMs)}</span>
              {segment.text}
            </div>
          ))
        )}
      </div>
    </Flexbox>
  );
};

export default LiveTranscript;
