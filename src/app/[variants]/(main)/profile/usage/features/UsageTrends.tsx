import { UsageLog } from '@lobechat/types/src/usage';
import { type BarChartProps } from '@lobehub/charts';
import { Segmented } from '@lobehub/ui';
import { useState , memo } from 'react';

import StatisticCard from '@/components/StatisticCard';

import { UsageChartProps } from '../Client';
import { UsageBarChart } from './components/UsageBarChart';

const groupBySpend = (data: UsageLog[]): { categories: string[]; data: BarChartProps['data'] } => {
  if (!data || data.length === 0) return { categories: [], data: [] };
  let formattedData: BarChartProps['data'] = [];
  let cateByProvider: Map<string, number> = data.reduce((acc, log) => {
    if (log.requestLogs) {
      for (const item of log.requestLogs) {
        if (item.provider) {
          acc.set(item.provider, 0);
        }
      }
    }
    return acc;
  }, new Map<string, number>());
  const categories: string[] = Array.from(cateByProvider.keys());
  formattedData = data.map((log) => {
    const totalObj = {
      day: log.day,
      total: log.totalSpend,
    };
    let todayCateProvider = new Map<string, number>(cateByProvider);
    for (const item of log.requestLogs) {
      todayCateProvider.set(
        item.provider,
        (todayCateProvider.get(item.provider) || 0) + (item.spend || 0),
      );
    }
    return {
      ...totalObj,
      ...Object.fromEntries(todayCateProvider.entries()),
    };
  });
  return {
    categories,
    data: formattedData,
  };
};

const groupByToken = (data: UsageLog[]): { categories: string[]; data: BarChartProps['data'] } => {
  if (!data || data.length === 0) return { categories: [], data: [] };
  let formattedData: BarChartProps['data'] = [];
  let cateByProvider: Map<string, number> = data.reduce((acc, log) => {
    if (log.requestLogs) {
      for (const item of log.requestLogs) {
        if (item.provider) {
          acc.set(item.provider, 0);
        }
      }
    }
    return acc;
  }, new Map<string, number>());
  const categories: string[] = Array.from(cateByProvider.keys());
  formattedData = data.map((log) => {
    const totalObj = {
      day: log.day,
      total: log.totalTokens,
    };
    let todayCateProvider = new Map<string, number>(cateByProvider);
    for (const item of log.requestLogs) {
      todayCateProvider.set(
        item.provider,
        (todayCateProvider.get(item.provider) || 0) + (item.totalTokens || 0),
      );
    }
    return {
      ...totalObj,
      ...Object.fromEntries(todayCateProvider.entries()),
    };
  });
  return {
    categories,
    data: formattedData,
  };
};

enum ShowType {
  Spend = 'spend',
  Token = 'token',
}

const UsageTrends = memo<UsageChartProps>(({ isLoading, data }) => {
  const [type, setType] = useState<ShowType>(ShowType.Spend);

  const { categories: spendCate, data: spendData } = groupBySpend(data || []);
  const { categories: tokenCate, data: tokenData } = groupByToken(data || []);
  return (
    <StatisticCard
      chart={
        data &&
        (type === ShowType.Spend ? (
          <UsageBarChart categories={spendCate} data={spendData} index="day" />
        ) : (
          <UsageBarChart categories={tokenCate} data={tokenData} index="day" />
        ))
      }
      extra={
        <Segmented
          onChange={(value) => setType(value as ShowType)}
          options={[
            { label: 'Spend', value: ShowType.Spend },
            { label: 'Token', value: ShowType.Token },
          ]}
          value={type}
        />
      }
      loading={isLoading}
    />
  );
});

export default UsageTrends;
