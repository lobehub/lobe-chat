'use client';

import { memo } from 'react';

import Table from '../../Table';
import { NextCacheFileData } from '../schema';

const DataTable = memo<{ data: NextCacheFileData[] }>(({ data }) => {
  return (
    <Table
      columns={['url', 'headers.content-type', 'body', 'kind', 'tags', 'revalidate', 'timestamp']}
      dataSource={data}
    />
  );
});

export default DataTable;
