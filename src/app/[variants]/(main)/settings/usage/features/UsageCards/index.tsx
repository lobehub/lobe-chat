import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { UsageChartProps } from '../../Client';
import ActiveModels from './ActiveModels';
import MonthSpend from './MonthSpend';
import TodaySpend from './TodaySpend';

const UsageCards = memo<UsageChartProps>(({ isLoading, data, groupBy }) => {
  return (
    <Flexbox gap={16} horizontal>
      <TodaySpend data={data} isLoading={isLoading} />
      <MonthSpend data={data} isLoading={isLoading} />
      <ActiveModels data={data} groupBy={groupBy} isLoading={isLoading} />
    </Flexbox>
  );
});

export default UsageCards;
