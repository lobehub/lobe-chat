import { BarChart, BarChartProps } from '@lobehub/charts';
import { FormGroup, Grid, Tabs } from '@lobehub/ui';
import { memo } from 'react';

import { FORM_STYLE } from '@/const/layoutTokens';
import { UsageLog } from '@/types/usage';

import { UsageChartProps } from '../Client';

const CateByProvider = memo(({ data, isLoading }: { data: UsageLog[]; isLoading: boolean }) => {
  const formatData = (
    data: UsageLog[],
  ): { categories: string[]; data: BarChartProps['data'] }[] => {
    if (!data || data.length === 0) return [];

    // Group providers across all logs
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

    // Create chart data for each provider
    return categories.map((provider) => {
      const chartData = data.map((log) => {
        const providerSpend = log.requestLogs
          .filter((item) => item.provider === provider)
          .reduce((sum, item) => sum + item.spend, 0);

        return {
          day: log.day,
          [provider]: providerSpend,
        };
      });

      return {
        categories: [provider],
        data: chartData,
      };
    });
  };

  const formatedData = formatData(data);

  return (
    <Grid gap={16} rows={2} width={'100%'}>
      {formatedData &&
        formatedData.map((item) => (
          <BarChart
            categories={item.categories}
            data={item.data}
            index={'day'}
            key={'day'}
            loading={isLoading || !data}
            stack={true}
          />
        ))}
    </Grid>
  );
});

const CateByModel = memo(({ data, isLoading }: { data: UsageLog[]; isLoading: boolean }) => {
  const formatData = (
    data: UsageLog[],
  ): { categories: string[]; data: BarChartProps['data'] }[] => {
    if (!data || data.length === 0) return [];

    // Group models across all logs
    let cateByModel: Map<string, number> = data.reduce((acc, log) => {
      if (log.requestLogs) {
        for (const item of log.requestLogs) {
          if (item.model) {
            acc.set(item.model, 0);
          }
        }
      }
      return acc;
    }, new Map<string, number>());

    const categories: string[] = Array.from(cateByModel.keys());

    // Create chart data for each model
    return categories.map((model) => {
      const chartData = data.map((log) => {
        const modelSpend = log.requestLogs
          .filter((item) => item.model === model)
          .reduce((sum, item) => sum + item.spend, 0);

        return {
          day: log.day,
          [model]: modelSpend,
        };
      });

      return {
        categories: [model],
        data: chartData,
      };
    });
  };

  const formatedData = formatData(data);

  return (
    <Grid gap={16} rows={2} width={'100%'}>
      {formatedData &&
        formatedData.map((item) => (
          <BarChart
            categories={item.categories}
            data={item.data}
            index={'day'}
            key={'day'}
            loading={isLoading || !data}
          />
        ))}
    </Grid>
  );
});

const AiUsageCategories = memo<UsageChartProps>(({ isLoading, ...rest }) => {
  const data = rest?.data || [];

  const items = [
    {
      children: <CateByProvider data={data} isLoading={isLoading || false} />,
      key: 'providers',
      label: 'Categorized by Providers',
    },
    {
      children: <CateByModel data={data} isLoading={isLoading || false} />,
      key: 'models',
      label: 'Categorized by Models',
    },
  ];

  return (
    <FormGroup style={FORM_STYLE.style} title={`Usage by Provider`} variant={'borderless'}>
      <Tabs defaultActiveKey="categories" items={items} />
    </FormGroup>
  );
});

export default AiUsageCategories;
