import { Button } from 'antd';
import isEqual from 'fast-deep-equal';
import { startCase } from 'lodash-es';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { agentMarketSelectors, useMarketStore } from '@/store/market';

const TagList = memo(() => {
  const agentTagList = useMarketStore(agentMarketSelectors.getAgentTagList, isEqual);
  const keywords = useMarketStore((s) => s.searchKeywords);

  return (
    <Flexbox gap={8} horizontal style={{ flexWrap: 'wrap' }}>
      {agentTagList.map((item) => (
        <Button
          key={item}
          onClick={() => useMarketStore.setState({ searchKeywords: item })}
          size={'small'}
          type={keywords === item ? 'primary' : 'default'}
        >
          {startCase(item)}
        </Button>
      ))}
    </Flexbox>
  );
});

export default TagList;
