import { AreaChart, AreaChartProps } from '@lobehub/charts';
import { FormGroup } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { formatDate } from '@/utils/format';
import { UsageLog } from '@/types/usage';
import { UsageChartProps } from '../Client';

const formatData = (data: UsageLog[]): { categories: string[], data: AreaChartProps['data'] } => {
    if (!data || data.length === 0) return { categories: [], data: [] };
    let formattedData: AreaChartProps['data'] = [];
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
    categories.push('total');
    formattedData = data.map((log) => {
        const totalObj = {
            date: formatDate(new Date(log.date * 1000)),
            total: log.totalSpend,
        }
        let todayCateProvider = new Map<string, number>(cateByProvider);
        for (const item of log.requestLogs) {
            todayCateProvider.set(item.provider, (todayCateProvider.get(item.provider) || 0) + item.spend);
        }
        return {
            ...totalObj,
            ...Object.fromEntries(todayCateProvider.entries()),
        };
    });
    return {
        categories,
        data: formattedData,
    }
}

const AiSpend = memo<UsageChartProps>(
    ({ isLoading, ...rest }) => {
        const { data, categories } = formatData(rest?.data || []);

        const barChart = (
            data &&
            <AreaChart
                categories={categories}
                data={data}
                index={'date'}
                loading={isLoading || !data}
            />
        );

        return (
            <FormGroup
                style={FORM_STYLE.style}
                title={`Spend ${data?.reduce((acc, log) => acc + log.total, 0) || 0}`}
                variant={'borderless'}
            >
                <Flexbox paddingBlock={24}>
                    {barChart}
                </Flexbox>
            </FormGroup>
        );
    },
);

export default AiSpend;
