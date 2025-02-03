import { Grid } from '@lobehub/ui';
import { memo } from 'react';
import urlJoin from 'url-join';

import { DiscoverModelItem } from '@/types/discover';

import Card from '../../models/features/Card';

const ModelList = memo<{ data: DiscoverModelItem[] }>(({ data }) => {
  return (
    <Grid maxItemWidth={280} rows={4}>
      {data.map((item) => (
        <Card {...item} href={urlJoin('/discover/model/', item.identifier)} key={item.identifier} />
      ))}
    </Grid>
  );
});

export default ModelList;
