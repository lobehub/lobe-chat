import { Grid } from '@lobehub/ui';
import Link from 'next/link';
import { memo } from 'react';
import urlJoin from 'url-join';

import { DiscoverPlugintem } from '@/types/discover';

import Card from '../../plugins/features/Card';

const PluginList = memo<{ data: DiscoverPlugintem[] }>(({ data }) => {
  return (
    <Grid maxItemWidth={280} rows={4}>
      {data.map((item) => (
        <Link href={urlJoin('/discover/plugin/', item.identifier)} key={item.identifier}>
          <Card showCategory variant={'compact'} {...item} />
        </Link>
      ))}
    </Grid>
  );
});

export default PluginList;
