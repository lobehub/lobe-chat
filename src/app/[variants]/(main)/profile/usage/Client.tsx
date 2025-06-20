'use client';

import { FormGroup, Grid } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { Col, Row } from 'antd';

import TotalSpend from './features/TotalSpend';
import TotalRequest from './features/TotalRequest';

const Client = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('auth');

  return (
    <Flexbox gap={mobile ? 0 : 24} >
      <Flexbox>
        Header
      </Flexbox>
      <Row gutter={[16, 16]} style={{ padding: mobile ? '0 16px' : '0 24px' }}>
        <Col span={12}>
          <TotalSpend mobile={mobile} />
        </Col>
        <Col span={12}>
          <Flexbox>
              <TotalRequest mobile={mobile} />
          </Flexbox>
        </Col>
      </Row>
    </Flexbox>
  );
});

export default Client;
