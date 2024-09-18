import { Grid } from '@lobehub/ui';
import Link from 'next/link';
import { memo } from 'react';
import urlJoin from 'url-join';

import { DiscoverModelItem } from '@/types/discover';

import Card from '../../models/features/Card';

const ModelList = memo<{ data: DiscoverModelItem[] }>(({ data }) => {
  return (
    <Grid maxItemWidth={280} rows={4}>
      {data.map((item) => (
        <Link href={urlJoin('/discover/model/', item.identifier)} key={item.identifier}>
          <Card {...item} />
        </Link>
      ))}
    </Grid>
  );
});

export default ModelList;
