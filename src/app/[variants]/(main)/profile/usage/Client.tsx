'use client';
import dayjs from 'dayjs';
import { Col, Row } from 'antd';
import { memo, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useClientDataSWR } from '@/libs/swr';
import { usageService } from '@/services/usage';
import { UsageLog } from '@/types/usage';

import TotalRequest from './features/TotalRequest';
import TotalSpend from './features/TotalSpend';
import UsageCategories from './features/UsageCategories';
import { DatePicker, DatePickerProps } from 'antd';
import { useTranslation } from 'react-i18next';


export interface UsageChartProps {
  data?: UsageLog[];
  inShare?: boolean;
  isLoading?: boolean;
  mobile?: boolean;
}

const Client = memo<{ mobile?: boolean }>(({ mobile }) => {

  const { i18n } = useTranslation()
  dayjs.locale(i18n.language)

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
        <DatePicker picker="month" value={dateRange} onChange={handleDateChange} />
      </Flexbox>
      <Flexbox>
          {data && <TotalSpend data={data} isLoading={isLoading} mobile={mobile} />}
      </Flexbox>
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
