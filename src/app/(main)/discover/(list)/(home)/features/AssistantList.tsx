import { Grid } from '@lobehub/ui';
import { memo } from 'react';
import urlJoin from 'url-join';

import InterceptingLink from '@/components/InterceptingLink';
import { DiscoverAssistantItem } from '@/types/discover';

import Card from '../../assistants/features/Card';

const AssistantList = memo<{ data: DiscoverAssistantItem[] }>(({ data }) => {
  return (
    <Grid maxItemWidth={280} rows={4}>
      {data.slice(0, 8).map((item) => (
        <InterceptingLink
          href={urlJoin('/discover/assistant/', item.identifier)}
          key={item.identifier}
        >
          <Card showCategory {...item} />
        </InterceptingLink>
      ))}
      {data.slice(8, 16).map((item) => (
        <InterceptingLink
          href={urlJoin('/discover/assistant/', item.identifier)}
          key={item.identifier}
        >
          <Card showCategory variant={'compact'} {...item} />
        </InterceptingLink>
      ))}
    </Grid>
  );
});

export default AssistantList;
