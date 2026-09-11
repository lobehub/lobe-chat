'use client';

import type { SharedAgentData } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import { Text } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const styles = createStaticStyles(({ css }) => ({
  caption: css`
    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
  `,
  cell: css`
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 3px;
    align-items: center;

    min-inline-size: 104px;
    padding-inline: 10px;
    border-inline-start: 1px solid ${cssVar.colorBorderSecondary};

    text-align: center;

    &:first-child {
      border-inline-start: 0;
    }
  `,
  label: css`
    font-size: 12px;
    font-weight: 500;
    color: ${cssVar.colorTextTertiary};
  `,
  root: css`
    overflow-x: auto;
    display: flex;
    padding-block: 22px;
    border-block-end: 1px solid ${cssVar.colorBorderSecondary};
  `,
  value: css`
    font-size: 19px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  `,
}));

/**
 * Reach and limits in one strip. Chosen to answer an agent-era question set
 * rather than an app-store one: how many people trusted it, how much it has
 * actually run, what it can reach, and where the ceiling is.
 */
const Metrics = memo<{ data: SharedAgentData }>(({ data }) => {
  const { t } = useTranslation('agent');
  const { stats, terms, toolGrants } = data;

  const cells: [string, number, string][] = [
    [
      t('share.visitor.profile.metrics.visitors'),
      stats.visitors,
      t('share.visitor.profile.metrics.visitorsCaption'),
    ],
    [
      t('share.visitor.profile.metrics.conversations'),
      stats.conversations,
      t('share.visitor.profile.metrics.conversationsCaption'),
    ],
    [
      t('share.visitor.profile.metrics.views'),
      stats.views,
      t('share.visitor.profile.metrics.viewsCaption'),
    ],
    [
      t('share.visitor.profile.metrics.tools'),
      toolGrants.length,
      t('share.visitor.profile.metrics.toolsCaption'),
    ],
    [
      t('share.visitor.profile.metrics.turns'),
      terms.maxTurnsPerTopic,
      t('share.visitor.profile.metrics.turnsCaption'),
    ],
  ];

  return (
    <Flexbox horizontal className={styles.root}>
      {cells.map(([label, value, caption]) => (
        <div className={styles.cell} key={label}>
          <Text className={styles.label}>{label}</Text>
          <Text className={styles.value}>{value}</Text>
          <Text className={styles.caption}>{caption}</Text>
        </div>
      ))}
    </Flexbox>
  );
});

Metrics.displayName = 'AgentShareProfileMetrics';

export default Metrics;
