import { Grid } from '@lobehub/ui';
import Link from 'next/link';
import { memo } from 'react';
import urlJoin from 'url-join';

import { DiscoverAssistantItem } from '@/types/discover';

import Card from '../../assistants/features/Card';

const AssistantList = memo<{ data: DiscoverAssistantItem[] }>(({ data }) => {
  return (
    <Grid maxItemWidth={280} rows={4}>
      {data.slice(0, 8).map((item) => (
        <Link href={urlJoin('/discover/assistant/', item.identifier)} key={item.identifier}>
          <Card showCategory {...item} />
        </Link>
      ))}
      {data.slice(8, 16).map((item) => (
        <Link href={urlJoin('/discover/assistant/', item.identifier)} key={item.identifier}>
          <Card showCategory variant={'compact'} {...item} />
        </Link>
      ))}
    </Grid>
  );
});

export default AssistantList;
