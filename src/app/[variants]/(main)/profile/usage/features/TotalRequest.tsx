import { AreaChart, type AreaChartProps } from '@lobehub/charts';
import { FormGroup } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
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
            day: log.day,
            total: log.totalTokens,
        }
        let todayCateProvider = new Map<string, number>(cateByProvider);
        for (const item of log.requestLogs) {
            todayCateProvider.set(item.provider, (todayCateProvider.get(item.provider) || 0) + (item.totalTokens || 0));
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

const AiRequest = memo<UsageChartProps>(
    ({ isLoading, ...rest }) => {
        const { categories, data } = formatData(rest?.data || [])
        const barChart = (
            data &&
            <AreaChart
                categories={categories}
                data={data}
                index={'day'}
                loading={isLoading || !data}
                style={{ maxHeight: 250 }}
            />
        );

        return (
            <FormGroup
                style={FORM_STYLE.style}
                title={`Tokens ${data?.reduce((acc, log) => acc + log.total, 0) || 0}`}
                variant={'borderless'}
            >
                <Flexbox paddingBlock={24}>
                    {barChart}
                </Flexbox>
            </FormGroup>
        );
    },
);

export default AiRequest;