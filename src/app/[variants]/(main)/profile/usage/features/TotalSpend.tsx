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

const AiSpend = memo<Omit<HeatmapsProps, 'data'> & { inShare?: boolean; mobile?: boolean }>(
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
                index={'date'}
            />
        );

        return (
            <FormGroup
                style={FORM_STYLE.style}
                title={`Spend ${data?.reduce((acc, log) => acc + log.totalSpend, 0) || 0}`}
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
