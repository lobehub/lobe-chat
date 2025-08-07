import { useState, memo } from 'react';
import { useTheme } from 'antd-style'
import { Flexbox } from 'react-layout-kit';
import dayjs from 'dayjs';

import { UsageLog } from '@lobechat/types/src/usage';
import { type BarChartProps } from '@lobehub/charts';
import { Segmented } from '@lobehub/ui';


import { formatNumber } from '@/utils/format';
import StatisticCard from '@/components/StatisticCard';
import Statistic from '@/components/Statistic';
import TitleWithPercentage from '@/components/StatisticCard/TitleWithPercentage';

import { UsageChartProps, GroupBy } from '../Client';
import TodaySpend from './TodaySpend'
import MonthSpend from './MonthSpend';
import ActiveModels from './ActiveModels';

const UsageCards = memo<UsageChartProps>(({ isLoading, data, groupBy }) => {

    const theme = useTheme();

    return (
        <Flexbox gap={16} horizontal>
            <TodaySpend data={data} isLoading={isLoading} />
            <MonthSpend data={data} isLoading={isLoading} />
            <ActiveModels data={data} isLoading={isLoading} groupBy={groupBy} />
        </Flexbox>
    );
});

export default UsageCards;