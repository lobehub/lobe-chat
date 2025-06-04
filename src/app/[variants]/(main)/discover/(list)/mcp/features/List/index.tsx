'use client';

import { PluginItem } from '@lobehub/market-sdk';
import { Grid } from '@lobehub/ui';
import { memo } from 'react';

import Item from './Item';

interface McpListProps {
  data?: PluginItem[];
}

const McpList = memo<McpListProps>(({ data = [] }) => {
  return (
    <Grid rows={3} width={'100%'}>
      {data.map((item, index) => (
        <Item key={index} {...item} />
      ))}
    </Grid>
  );
});

export default McpList;
