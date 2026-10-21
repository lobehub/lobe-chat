import { createStaticStyles, cssVar } from '@lobehub/ui';
import { useSyncExternalStore } from 'react';

import { meetingRecorder } from '../meetingRecorder';

const styles = createStaticStyles(({ css }) => ({
  bar: css`
    transform-origin: center;

    flex: 1;

    min-width: 2px;
    height: 100%;
    border-radius: 2px;

    background: ${cssVar.colorPrimary};

    transition: transform 180ms ease-out;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,
  paused: css`
    background: ${cssVar.colorTextQuaternary};
  `,
  root: css`
    display: flex;
    gap: 2px;
    align-items: center;

    width: 100%;
    height: 100%;
  `,
}));

const subscribe = (listener: () => void) => meetingRecorder.levels.subscribe(listener);
const getLevels = () => meetingRecorder.levels.levels;

/** Speech sits around 0.02–0.2 RMS; a square root spreads it across the bar height. */
const toScale = (level: number) => Math.max(0.06, Math.min(1, Math.sqrt(level) * 2.2));

interface WaveformProps {
  /** Show only the newest `bars` levels (the minimized chip has room for a few). */
  bars?: number;
  height: number;
  paused?: boolean;
}

/** Recent input levels as scrolling bars, newest on the right. */
const Waveform = ({ bars, height, paused }: WaveformProps) => {
  const history = useSyncExternalStore(subscribe, getLevels, getLevels);
  const levels = bars ? history.slice(-bars) : history;

  return (
    <div aria-hidden className={styles.root} style={{ height }}>
      {levels.map((level, index) => (
        <span
          className={paused ? `${styles.bar} ${styles.paused}` : styles.bar}
          key={index}
          style={{ transform: `scaleY(${toScale(level)})` }}
        />
      ))}
    </div>
  );
};

export default Waveform;
