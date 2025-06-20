import { BarChart, Heatmaps, HeatmapsProps } from '@lobehub/charts';
import { FormGroup, Grid, Icon, Tag } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useClientDataSWR } from '@/libs/swr';
import { usageService } from '@/services/usage';
import { formatDate } from '@/utils/format';
import StatisticCard from '@/components/StatisticCard';
import Statistic from '@/components/Statistic';

const AiUsage = memo<Omit<HeatmapsProps, 'data'> & { inShare?: boolean; mobile?: boolean }>(
    ({ inShare, mobile, ...rest }) => {
        const { t } = useTranslation('auth');
        const theme = useTheme();
        const { data, isLoading } = useClientDataSWR('stats-heatmaps', async () =>
            usageService.getUsages()
        );

        const barChart = (
            data &&
            <BarChart 
                categories={['spend']}
                data={data?.map(log => {
                    console.log('log', log);
                    return {
                        'spend': log.totalSpend,
                        'date': formatDate(new Date(log.date * 1000)),
                    }})}
                index={'date'} />
        );

        const stats = (
            <Grid maxItemWidth={150} paddingBlock={16} rows={4}>
                <StatisticCard
                    highlight={mobile ? undefined : theme.purple}
                    loading={isLoading || !data}
                    statistic={{
                        description: (
                            <Statistic
                                title={t('date.prevMonth')}
                                value={
                                    data?.length
                                        ? data.reduce((acc, log) => acc + log.totalSpend, 0)
                                        : '--'
                                }
                            />
                        ),
                        precision: 2,
                        value: data?.reduce((acc, log) => acc + log.totalSpend, 0) || '--',
                    }}
                    title={'TotalSpend'}
                />
            </Grid>
        )

        return (
            <FormGroup
                style={FORM_STYLE.style}
                title={'Usage'}
                variant={'borderless'}
            >
                <Flexbox paddingBlock={24}>
                    <Flexbox>{stats}</Flexbox>
                    {barChart}
                </Flexbox>
            </FormGroup>
        );
    },
);

export default AiUsage;
