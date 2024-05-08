'use client';

import { Skeleton } from 'antd';
import { Flexbox } from 'react-layout-kit';

export default () => (
  <Flexbox gap={16}>
    <Skeleton.Input active block />
    <Skeleton paragraph={{ rows: 8 }} style={{ marginBlock: 24 }} title={false} />
    <Skeleton.Button active />
    <Skeleton paragraph={{ rows: 8 }} style={{ marginBlock: 24 }} title={false} />
    <Skeleton.Button active />
    <Skeleton paragraph={{ rows: 8 }} style={{ marginBlock: 24 }} title={false} />
  </Flexbox>
);
