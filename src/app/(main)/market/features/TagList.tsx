'use client';

import { Button } from 'antd';
import { useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { startCase } from 'lodash-es';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSearch } from '@/app/(main)/market/hooks/useSearch';
import { agentMarketSelectors, useMarketStore } from '@/store/market';

const TagList = memo<{ keywords?: string }>(({ keywords }) => {
  const { md = true } = useResponsive();
  const search = useSearch();
  const agentTagList = useMarketStore(agentMarketSelectors.getAgentTagList, isEqual);

  const list = md ? agentTagList : agentTagList.slice(0, 20);

  return (
    <Flexbox gap={6} horizontal style={{ flexWrap: 'wrap' }}>
      {list.map((item) => {
        const isActive = keywords === item;
        return (
          <Button
            key={item}
            onClick={() => {
              search(isActive ? '' : item);
            }}
            shape={'round'}
            size={'small'}
            type={isActive ? 'primary' : 'default'}
          >
            {startCase(item)}
          </Button>
        );
      })}
    </Flexbox>
  );
});

export default TagList;
