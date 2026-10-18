'use client';

import { LineChart, ProgressBar } from '@lobehub/charts';
import {
  Button,
  createStaticStyles,
  cssVar,
  Flexbox,
  Icon,
  Skeleton,
  Tag,
  Text,
  useTheme,
} from '@lobehub/ui';
import dayjs from 'dayjs';
import { Check, Pencil, Plus } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncError from '@/components/AsyncError';
import { openDeclareMetricModal } from '@/features/AgentGoals/NorthStarMetrics/DeclareMetricModal';
import {
  buildNorthStarChartRows,
  buildObservationRows,
  formatMetricValue,
} from '@/features/AgentGoals/NorthStarMetrics/northStar';
import { openRecordObservationModal } from '@/features/AgentGoals/NorthStarMetrics/RecordObservationModal';
import { usePermission } from '@/hooks/usePermission';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

import { useNorthStarCard } from './useNorthStarCard';

/**
 * Detail of one north-star clause: where the number stands against its
 * target, how it got there, and the actions that move it — recording a new
 * observation or adjusting the clause itself.
 */

const styles = createStaticStyles(({ css }) => ({
  mono: css`
    font-family: ${cssVar.fontFamilyCode};
    font-variant-numeric: tabular-nums;
  `,
  row: css`
    padding-block: 8px;
    border-block-end: 1px solid ${cssVar.colorBorderSecondary};

    &:last-child {
      border-block-end: none;
    }
  `,
  section: css`
    font-size: 12px;
    font-weight: 600;
    color: ${cssVar.colorTextSecondary};
  `,
}));

const DAY_MS = 24 * 60 * 60 * 1000;

/** Axis labels at the granularity the series actually spans. */
const timeFormat = (points: { observedAt: Date }[]) => {
  const span =
    points.length > 1 ? points.at(-1)!.observedAt.getTime() - points[0].observedAt.getTime() : 0;
  return span >= DAY_MS ? 'MM-DD HH:mm' : 'HH:mm:ss';
};

const formatDelta = (delta: number) =>
  `${delta > 0 ? '+' : delta < 0 ? '−' : '±'}${formatMetricValue(Math.abs(delta))}`;

const deltaColor = (delta: number) =>
  delta > 0 ? cssVar.colorSuccess : delta < 0 ? cssVar.colorError : cssVar.colorTextTertiary;

const NorthStarDetail = memo<{ goalId: string; metricKey: string }>(({ goalId, metricKey }) => {
  const { t } = useTranslation('chat');
  const theme = useTheme();
  const { allowed: canEdit } = usePermission('create_content');
  const { card, criterion, error, isLoading, loaded, points, retry } = useNorthStarCard(
    goalId,
    metricKey,
  );

  const chartRows = useMemo(
    () =>
      card
        ? buildNorthStarChartRows(points, card.target, (date) =>
            dayjs(date).format(timeFormat(points)),
          )
        : [],
    [card, points],
  );
  const history = useMemo(() => buildObservationRows(points), [points]);

  if (!loaded || isLoading)
    return (
      <Flexbox gap={16} padding={16}>
        <Skeleton height={96} />
        <Skeleton height={200} />
      </Flexbox>
    );

  if (!criterion || !card)
    return (
      <Flexbox padding={16}>
        <Text type={'secondary'}>{t('goalProcess.northStar.detail.removed')}</Text>
      </Flexbox>
    );

  if (error && points.length === 0)
    return (
      <Flexbox padding={16}>
        <AsyncError error={error} variant={'metric'} onRetry={retry} />
      </Flexbox>
    );

  const accent = card.met ? cssVar.colorSuccess : cssVar.colorInfo;
  const unit = card.unit ? ` ${card.unit}` : '';

  return (
    <Flexbox gap={24} padding={16}>
      <Flexbox gap={10}>
        <Flexbox horizontal align={'center'} justify={'space-between'}>
          <Flexbox horizontal align={'baseline'} gap={8}>
            <Text fontSize={28} style={{ color: card.met ? accent : undefined }} weight={700}>
              {formatMetricValue(card.current)}
            </Text>
            <Text type={'secondary'}>
              {t(`goalProcess.northStar.op.${card.op}` as const)} {formatMetricValue(card.target)}
              {unit}
            </Text>
          </Flexbox>
          {card.met && (
            <Tag color={'success'}>
              <Icon icon={Check} size={12} /> {t('goalProcess.northStar.met')}
            </Tag>
          )}
        </Flexbox>
        <ProgressBar color={accent} size={6} value={card.percent} />
        <Text
          fontSize={12}
          style={card.stale ? { color: cssVar.colorWarning } : undefined}
          type={'secondary'}
        >
          {card.latestAt == null
            ? t('goalProcess.northStar.unmeasured')
            : t('goalProcess.northStar.lastObserved', { time: dayjs(card.latestAt).fromNow() })}
          {card.stale ? ` · ${t('goalProcess.northStar.staleWarning')}` : ''}
        </Text>
        {canEdit && (
          <Flexbox horizontal gap={8}>
            <Button
              icon={<Icon icon={Plus} />}
              type={'primary'}
              onClick={() => openRecordObservationModal(goalId, card.key, card.label)}
            >
              {t('goalProcess.northStar.record.title')}
            </Button>
            <Button
              icon={<Icon icon={Pencil} />}
              onClick={() => openDeclareMetricModal(goalId, criterion)}
            >
              {t('goalProcess.northStar.edit.title')}
            </Button>
          </Flexbox>
        )}
      </Flexbox>

      <Flexbox gap={8}>
        <Text className={styles.section}>{t('goalProcess.northStar.detail.trend')}</Text>
        {chartRows.length < 2 ? (
          <Text fontSize={12} type={'secondary'}>
            {t('goalProcess.northStar.detail.trendEmpty')}
          </Text>
        ) : (
          <LineChart
            autoMinValue
            categories={['value', 'target']}
            // Literal theme colors: the chart ids its SVG gradients by the color string.
            colors={[card.met ? theme.colorSuccess : theme.colorInfo, theme.colorTextQuaternary]}
            data={chartRows}
            height={200}
            index={'time'}
            startEndOnly={chartRows.length > 8}
            valueFormatter={formatMetricValue}
            yAxisWidth={56}
            customCategories={{
              target: t('goalProcess.northStar.detail.target'),
              value: card.label,
            }}
          />
        )}
      </Flexbox>

      <Flexbox gap={4}>
        <Text className={styles.section}>
          {t('goalProcess.northStar.detail.history', { count: history.length })}
        </Text>
        {history.length === 0 ? (
          <Text fontSize={12} type={'secondary'}>
            {t('goalProcess.northStar.unmeasured')}
          </Text>
        ) : (
          <Flexbox>
            {history.map((row) => (
              <Flexbox
                horizontal
                align={'center'}
                className={styles.row}
                justify={'space-between'}
                key={row.observedAt.getTime()}
              >
                <Flexbox horizontal align={'baseline'} gap={8}>
                  <Text className={styles.mono} weight={500}>
                    {formatMetricValue(row.value)}
                  </Text>
                  {row.delta != null && (
                    <Text
                      className={styles.mono}
                      fontSize={12}
                      style={{ color: deltaColor(row.delta) }}
                    >
                      {formatDelta(row.delta)}
                    </Text>
                  )}
                </Flexbox>
                <Text
                  fontSize={12}
                  title={dayjs(row.observedAt).format('YYYY-MM-DD HH:mm:ss')}
                  type={'secondary'}
                >
                  {dayjs(row.observedAt).fromNow()}
                </Text>
              </Flexbox>
            ))}
          </Flexbox>
        )}
      </Flexbox>
    </Flexbox>
  );
});

NorthStarDetail.displayName = 'GoalNorthStarDetail';

const Body = memo(() => {
  const view = useChatStore(chatPortalSelectors.goalNorthStarView);
  if (!view) return null;

  return <NorthStarDetail goalId={view.goalId} key={view.metricKey} metricKey={view.metricKey} />;
});

Body.displayName = 'GoalNorthStarBody';

export default Body;
