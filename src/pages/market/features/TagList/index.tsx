import { Button } from 'antd';
import isEqual from 'fast-deep-equal';
import { startCase } from 'lodash-es';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { selectors, useMarketStore } from '@/store/market';

const TagList = memo(() => {
  const agentTagList = useMarketStore(selectors.getAgentTagList, isEqual);
  return (
    <Flexbox gap={8} horizontal style={{ flexWrap: 'wrap' }}>
      {agentTagList.map((item) => (
        <Button key={item} size={'small'}>
          {startCase(item.trim())}
        </Button>
      ))}
    </Flexbox>
  );
});

export default TagList;
