import { ActionIcon, createStaticStyles, cssVar, Flexbox, Slider, Text } from '@lobehub/ui';
import { PauseIcon, PlayIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatClock } from '../format';
import type { Playback } from './usePlayback';

const styles = createStaticStyles(({ css }) => ({
  root: css`
    padding-block: 8px;
    padding-inline: 8px 16px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};

    background: ${cssVar.colorBgContainer};
  `,
  time: css`
    flex: none;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: ${cssVar.colorTextSecondary};
  `,
}));

interface AudioPlayerProps {
  /** Shown instead of the controls when there is nothing to play. */
  emptyHint?: string;
  playback: Playback;
  src?: string;
}

const AudioPlayer = ({ emptyHint, playback, src }: AudioPlayerProps) => {
  const { t } = useTranslation('meeting');
  const { audioRef, currentMs, durationMs, playing, seek, toggle } = playback;

  return (
    <Flexbox horizontal align={'center'} className={styles.root} gap={12}>
      <audio preload={'metadata'} ref={audioRef} src={src} />
      {src ? (
        <>
          <ActionIcon
            aria-label={playing ? t('recorder.pause') : t('recorder.resume')}
            data-testid={'meeting-audio-toggle'}
            icon={playing ? PauseIcon : PlayIcon}
            title={playing ? t('recorder.pause') : t('recorder.resume')}
            onClick={toggle}
          />
          <span className={styles.time}>{formatClock(currentMs)}</span>
          <Flexbox flex={1}>
            <Slider
              max={Math.max(durationMs, 1)}
              min={0}
              step={100}
              value={Math.min(currentMs, durationMs)}
              onChange={(value) => seek(value as number, { play: playing })}
            />
          </Flexbox>
          <span className={styles.time}>{formatClock(durationMs)}</span>
        </>
      ) : (
        <Text fontSize={13} style={{ paddingInlineStart: 8 }} type={'secondary'}>
          {emptyHint}
        </Text>
      )}
    </Flexbox>
  );
};

export default AudioPlayer;
