'use client';

import { UsageLog } from '@lobechat/types/src/usage';
import { Icon, Segmented } from '@lobehub/ui';
import { Col, DatePicker, DatePickerProps, Row } from 'antd';
import dayjs from 'dayjs';
import { Brain, Codesandbox } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useClientDataSWR } from '@/libs/swr';
import { usageService } from '@/services/usage';

import Welcome from '../stats/features/Welcome';
import UsageCategories from './features/UsageCategories';
import UsageTrends from './features/UsageTrends';
import UsageCards from './UsageCards';

export interface UsageChartProps {
  data?: UsageLog[];
  groupBy?: GroupBy;
  inShare?: boolean;
  isLoading?: boolean;
  mobile?: boolean;
}

export enum GroupBy {
  Model = 'model',
  Provider = 'provider',
}

const Client = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { i18n } = useTranslation();
  dayjs.locale(i18n.language);

  const [groupBy, setGroupBy] = useState<GroupBy>(GroupBy.Model);
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
        <Row>
          <Col span={16}>
            {mobile ? (
              <Welcome mobile />
            ) : (
              <Flexbox align={'flex-start'} gap={16} horizontal justify={'space-between'}>
                <Welcome />
              </Flexbox>
            )}
          </Col>
          <Col span={8}>
            <Flexbox gap={16} horizontal>
              <Segmented
                onChange={(v) => setGroupBy(v as GroupBy)}
                options={[
                  {
                    icon: <Icon icon={Codesandbox} />,
                    label: 'Model',
                    value: GroupBy.Model,
                  },
                  {
                    icon: <Icon icon={Brain} />,
                    label: 'Provider',
                    value: GroupBy.Provider,
                  },
                ]}
                value={groupBy}
              />
              <DatePicker onChange={handleDateChange} picker="month" value={dateRange} />
            </Flexbox>
          </Col>
        </Row>
      </Flexbox>
      <Flexbox>
        {data && <UsageCards data={data} groupBy={groupBy} isLoading={isLoading} />}
      </Flexbox>
      <Flexbox>
        {data && <UsageTrends data={data} groupBy={groupBy} isLoading={isLoading} />}
      </Flexbox>
      <Row>
        <UsageCategories data={data} />
      </Row>
    </Flexbox>
  );
});

export default Client;
