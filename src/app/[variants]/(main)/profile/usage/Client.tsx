'use client';

import { Col, Row } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useClientDataSWR } from '@/libs/swr';
import { usageService } from '@/services/usage';
import { UsageLog } from '@/types/usage';

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
  const { data, isLoading } = useClientDataSWR('stats-heatmaps', async () =>
    usageService.getUsages(),
  );

  return (
    <Flexbox gap={mobile ? 0 : 24}>
      <Flexbox>Header</Flexbox>
      <Row gutter={[16, 16]} style={{ padding: mobile ? '0 16px' : '0 24px' }}>
        <Col span={12}>
          {data && <TotalSpend data={data} isLoading={isLoading} mobile={mobile} />}
        </Col>
        <Col span={12}>
          <Flexbox>
            {data && <TotalRequest data={data} isLoading={isLoading} mobile={mobile} />}
          </Flexbox>
        </Col>
      </Row>
      <Row>
        <UsageCategories data={data} />
      </Row>
    </Flexbox>
  );
});

export default Client;
