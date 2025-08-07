'use client';

import { UsageLog } from '@lobechat/types/src/usage';
import { Row , DatePicker, DatePickerProps } from 'antd';
import dayjs from 'dayjs';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useClientDataSWR } from '@/libs/swr';
import { usageService } from '@/services/usage';

import TotalRequest from './features/TotalRequest';
import TotalSpend from './features/TotalSpend';
import UsageCategories from './features/UsageCategories';

export interface UsageChartProps {
  data?: UsageLog[];
  inShare?: boolean;
  isLoading?: boolean;
  mobile?: boolean;
}

const Client = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { i18n } = useTranslation();
  dayjs.locale(i18n.language);

  const [dateRange, setDateRange] = useState<dayjs.Dayjs>(dayjs(new Date()));
  const [dateStrings, setDateStrings] = useState<string>();

  const { data, isLoading, mutate } = useClientDataSWR('stats-heatmaps', async () =>
    usageService.getUsages(dateStrings),
  );

  useEffect(() => {
    if (dateStrings) {
      mutate();
    }
  }, [dateStrings]);

  const handleDateChange: DatePickerProps['onChange'] = (dates, dateStrings) => {
    setDateRange(dates);
    if (typeof dateStrings === 'string') {
      setDateStrings(dateStrings);
    }
  };

  return (
    <Flexbox gap={mobile ? 0 : 24}>
      <Flexbox>
        <DatePicker onChange={handleDateChange} picker="month" value={dateRange} />
      </Flexbox>
      <Flexbox>{data && <TotalSpend data={data} isLoading={isLoading} mobile={mobile} />}</Flexbox>
      <Flexbox>
        {data && <TotalRequest data={data} isLoading={isLoading} mobile={mobile} />}
      </Flexbox>
      <Row>
        <UsageCategories data={data} />
      </Row>
    </Flexbox>
  );
});

export default Client;
