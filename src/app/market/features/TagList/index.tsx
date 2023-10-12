import { Button, Skeleton } from 'antd';
import isEqual from 'fast-deep-equal';
import { startCase } from 'lodash-es';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { agentMarketSelectors, useMarketStore } from '@/store/market';

const TagList = memo(() => {
  const agentTagList = useMarketStore(agentMarketSelectors.getAgentTagList, isEqual);
  const keywords = useMarketStore((s) => s.searchKeywords);

  return (
    <Flexbox gap={6} horizontal style={{ flexWrap: 'wrap' }}>
      {agentTagList?.length > 0
        ? agentTagList.map((item) => (
            <Button
              key={item}
              onClick={() => useMarketStore.setState({ searchKeywords: item })}
              shape={'round'}
              size={'small'}
              type={keywords === item ? 'primary' : 'default'}
            >
              {startCase(item)}
            </Button>
          ))
        : Array.from({ length: 5 })
            .fill('')
            .map((_, index) => <Skeleton.Button key={index} shape={'round'} size={'small'} />)}
    </Flexbox>
  );
});

export default TagList;
