'use client';

import { Text } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { type ReactNode } from 'react';

import { formatPercent, usageLevel } from './format';
import { USAGE_COLOR, usageTextColor } from './shared';

/** Tick count of the segmented bar — fine enough that 1–2% still lights a tick. */
const SEGMENTS = 40;

const styles = createStaticStyles(({ css }) => ({
  // Fills its track's width — a grid cell in the card meter, a full-width row
  // in the detail stat card. No `flex: 1` — in a column flexbox that would
  // zero the explicit height.
  bar: css`
    display: flex;
    flex: none;
    gap: 1px;

    width: 100%;
    min-width: 0;
  `,
  // Label / bar / value columns shared by every meter in the group, so labels
  // of different lengths (and locales) never wrap and the bars stay aligned.
  group: css`
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr) 36px;
    gap: 8px 12px;
    align-items: center;
  `,
  segment: css`
    flex: 1;
    min-width: 1px;
    border-radius: 1px;
  `,
}));

/** Lit ticks for a reading: any non-zero usage lights at least one, so a running machine never reads as empty. */
export const litSegments = (value: number | null | undefined, segments = SEGMENTS) => {
  if (value === null || value === undefined || value <= 0) return 0;
  return Math.min(segments, Math.max(1, Math.round((value / 100) * segments)));
};

interface UsageBarProps {
  /** Bar height in px. */
  height?: number;
  value: number | null | undefined;
}

/**
 * The segmented bar alone, colored by the normal / high / critical thresholds.
 * No reading keeps every segment unlit.
 */
export const UsageBar = ({ height = 12, value }: UsageBarProps) => {
  const level = usageLevel(value);
  const lit = litSegments(value);
  const color = level ? USAGE_COLOR[level] : cssVar.colorFillSecondary;

  return (
    <div aria-hidden className={styles.bar} style={{ height }}>
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <span
          className={styles.segment}
          key={i}
          style={{ background: i < lit ? color : cssVar.colorFillSecondary }}
        />
      ))}
    </div>
  );
};

interface UsageMeterProps {
  label: string;
  value: number | null | undefined;
}

export const UsageMeterGroup = ({ children }: { children: ReactNode }) => (
  <div className={styles.group}>{children}</div>
);

/**
 * One labelled usage reading as a segmented bar, colored by the same
 * normal / high / critical thresholds as the health strip. No reading keeps
 * the bar unlit and the value as an em dash, so a card keeps its height
 * whether or not the device has reported. Render inside {@link UsageMeterGroup}.
 */
const UsageMeter = ({ label, value }: UsageMeterProps) => {
  const level = usageLevel(value);

  return (
    <>
      <Text fontSize={13} style={{ whiteSpace: 'nowrap' }} type={'secondary'}>
        {label}
      </Text>
      <UsageBar value={value} />
      <Text
        fontSize={13}
        style={{ color: usageTextColor(level), textAlign: 'end' }}
        type={level ? undefined : 'secondary'}
      >
        {formatPercent(value)}
      </Text>
    </>
  );
};

export default UsageMeter;
