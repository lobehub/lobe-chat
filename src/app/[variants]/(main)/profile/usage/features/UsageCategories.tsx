import { BarChart, BarChartProps } from '@lobehub/charts';
import { FormGroup, Grid, Tabs } from '@lobehub/ui';
import { memo } from 'react';

import { FORM_STYLE } from '@/const/layoutTokens';
import { UsageLog } from '@/types/usage';

import { UsageChartProps } from '../Client';
import { Flexbox } from 'react-layout-kit';

const CateByProvider = memo(({ data, isLoading }: { data: UsageLog[]; isLoading: boolean }) => {
  const formatData = (
    data: UsageLog[],
  ): { categories: string[]; data: BarChartProps['data']; provider: string }[] => {
    if (!data || data.length === 0) return [];

    // Group providers across all logs
    const providerCategories: string[] = Array.from(new Set(
      data.map((log) => log.requestLogs.map(item => item.provider)).flat()
    ));

    // Create chart data for each provider
    return providerCategories.map((provider) => {
      const modelCategories: string[] = Array.from(new Set(
        data.map((log) => log.requestLogs.filter((item) => item.provider === provider).map(item => item.model)).flat()
      ));

      const chartData = data.map((log) => {
        const providerSpend = log.requestLogs
          .filter((item) => item.provider === provider)

        let dataBody: any = {
          day: log.day,
        }

        modelCategories.forEach((model) => {
          const modelSpend = providerSpend.reduce((sum, item) => item.model === model ? sum + item.spend : sum, 0);
          dataBody[model] = modelSpend;
        });

        return dataBody;
      });

      return {
        categories: modelCategories,
        data: chartData,
        provider: provider,
      };
    });
  };

  const formattedData = formatData(data);

  return (
    <Grid gap={16} rows={1} width={'100%'}>
      {formattedData &&
        formattedData.map((item) => (
          <BarChart
            title={item.provider}
            categories={item.categories}
            data={item.data}
            index={'day'}
            loading={isLoading || !data}
            stack
          />
        ))}
    </Grid>
  );
});

const CateByModel = memo(({ data, isLoading }: { data: UsageLog[]; isLoading: boolean }) => {
  const formatData = (
    data: UsageLog[],
  ): { categories: string[]; data: BarChartProps['data']; model: string }[] => {
    if (!data || data.length === 0) return [];

    // Group models across all logs
    const modelCategories: string[] = Array.from(new Set(
      data.map((log) => log.requestLogs.map(item => item.model)).flat()
    ));

    // Create chart data for each model
    return modelCategories.map((model) => {
      const providerCategories: string[] = Array.from(new Set(
        data.map((log) => log.requestLogs.filter((item) => item.model === model).map(item => item.provider)).flat()
      ));

      const chartData = data.map((log) => {
        const modelSpend = log.requestLogs
          .filter((item) => item.model === model)

        let dataBody: any = {
          day: log.day,
        }

        providerCategories.forEach((provider) => {
          const providerSpend = modelSpend.reduce((sum, item) => item.provider === provider ? sum + item.spend : sum, 0);
          dataBody[provider] = providerSpend;
        });

        return dataBody;
      });

      return {
        categories: providerCategories,
        data: chartData,
        model: model,
      };
    });
  };

  const formattedData = formatData(data);

  return (
    <Grid gap={16} rows={1} width={'100%'}>
      {formattedData &&
        formattedData.map((item) => (
          <BarChart
            title={item.model}
            categories={item.categories}
            data={item.data}
            index={'day'}
            loading={isLoading || !data}
            stack
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
