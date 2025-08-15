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

const computeSpend = (data: UsageLog[]): {
  today: number | string;
  yesterday: number | string;
} => {

  if (!data || data.length === 0) return { today: 0, yesterday: 0 };

  const today = data.find((log) => dayjs(log.day).isToday())?.totalSpend ?? 0;
  const yesterday = data.find((log) => dayjs(log.day).isYesterday())?.totalSpend ?? 0;

  return {
    today: formatNumber(today),
    yesterday: formatNumber(yesterday),
  }
}

const TodaySpend = memo<UsageChartProps>(({ data, isLoading }) => {
  const { t } = useTranslation('common');
  const theme = useTheme();

  const { today, yesterday } = computeSpend(data || []);


  return (
    <StatisticCard
      highlight={theme.green}
      statistic={
        {
          description: (
            <Statistic
              title='Yesterday'
              value={yesterday}
            />
          ),
          precision: 0,
          value: today,
          prefix: '$',
        }
      }
      loading={isLoading}
      title={
        <TitleWithPercentage
          prvCount={typeof yesterday === 'number' ? yesterday : 0}
          count={typeof today === 'number' ? today : 0}
          title={'Today'}
        />
      }
    />
  );
});

export default TodaySpend;
