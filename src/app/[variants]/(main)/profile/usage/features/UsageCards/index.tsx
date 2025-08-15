import { memo } from 'react';
import { useTheme } from 'antd-style'
import { Flexbox } from 'react-layout-kit';
import { FormGroup } from '@lobehub/ui';

import { UsageChartProps } from '../../Client';
import TodaySpend from './TodaySpend'
import MonthSpend from './MonthSpend';
import ActiveModels from './ActiveModels';

const UsageCards = memo<UsageChartProps>(({ isLoading, data, groupBy }) => {

    const theme = useTheme();

    return (
        <FormGroup title={"Usage"}>
            <Flexbox gap={16} horizontal>
                <TodaySpend data={data} isLoading={isLoading} />
                <MonthSpend data={data} isLoading={isLoading} />
                <ActiveModels data={data} isLoading={isLoading} groupBy={groupBy} />
            </Flexbox>
        </FormGroup>
    );
});

export default UsageCards;