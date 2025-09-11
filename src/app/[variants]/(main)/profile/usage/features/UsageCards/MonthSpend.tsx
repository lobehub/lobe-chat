'use client';

import { useTheme } from 'antd-style';
import { CSSProperties, memo } from 'react';
import { useTranslation } from 'react-i18next';

import dayjs from 'dayjs';

import Statistic from '@/components/Statistic';
import StatisticCard from '@/components/StatisticCard';
import TitleWithPercentage from '@/components/StatisticCard/TitleWithPercentage';
import { UsageLog } from '@lobechat/types/src/usage';
import { formatNumber } from '@/utils/format';

import { UsageChartProps } from '../../Client'

const computeMonth = (data: UsageLog[]): {
  spend: number | string;
  calls: number | string;
} => {

  if (!data || data.length === 0) return { spend: 0, calls: 0 };

  const spend = data.reduce((acc, log) => acc + (log.totalSpend || 0), 0);
  const calls = data.reduce((acc, log) => acc + (log.records.length || 0), 0);

  return {
    spend: formatNumber(spend / 1000_000),
    calls: formatNumber(calls),
  }
}

const MonthSpend = memo<UsageChartProps>(({ data, isLoading }) => {
  const { t } = useTranslation('common');
  const theme = useTheme();

  const { spend, calls } = computeMonth(data || []);


  return (
    <StatisticCard
      highlight={theme.blue}
      statistic={
        {
          description: (
            <Statistic
              title='Model Calls'
              value={calls}
            />
          ),
          precision: 2,
          value: spend,
          prefix: '$',
        }
      }
      loading={isLoading}
      title={
        <TitleWithPercentage
          title={'Month'}
        />
      }
    />
  );
});

export default MonthSpend;