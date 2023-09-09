import { SpotlightCard } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';

import { selectors, useMarketStore } from '@/store/market';

import GridCardItem from './GridCardItem';
import Loading from './Loading';

const gridRender = (item: any) => <GridCardItem {...item} />;

const GridCard = memo(() => {
  const { mobile } = useResponsive();
  const agentList = useMarketStore(selectors.getAgentList, isEqual);

  const [useFetchAgentList, keywords] = useMarketStore((s) => [
    s.useFetchAgentList,
    s.searchKeywords,
  ]);
  useFetchAgentList();

  const agentListData = useMemo(() => {
    if (!keywords) return agentList;
    return agentList.filter(({ meta }) => JSON.stringify(meta).toLowerCase().includes(keywords));
  }, [agentList, keywords]);

  if (!agentList) return <Loading num={mobile ? 4 : 16} />;

  return <SpotlightCard items={agentListData} renderItem={gridRender} />;
});

export default GridCard;
