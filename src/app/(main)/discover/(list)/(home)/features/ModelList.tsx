import { Grid } from '@lobehub/ui';
import { memo } from 'react';
import urlJoin from 'url-join';

import InterceptingLink from '@/components/InterceptingLink';
import { DiscoverModelItem } from '@/types/discover';

import Card from '../../models/features/Card';

const ModelList = memo<{ data: DiscoverModelItem[] }>(({ data }) => {
  return (
    <Grid maxItemWidth={280} rows={4}>
      {data.map((item) => (
        <InterceptingLink href={urlJoin('/discover/model/', item.identifier)} key={item.identifier}>
          <Card {...item} />
        </InterceptingLink>
      ))}
    </Grid>
  );
});

export default ModelList;
