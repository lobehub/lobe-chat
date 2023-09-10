import { SpotlightCard } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';

import AgentModal from '@/pages/market/features/AgentModal';
import { selectors, useMarketStore } from '@/store/market';

import TagList from '../TagList';
import GridCardItem from './GridCardItem';
import Loading from './Loading';

const gridRender = (item: any) => <GridCardItem {...item} />;

const GridCard = memo(() => {
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

  if (!agentList) return <Loading />;

  return (
    <>
      <TagList />
      <SpotlightCard items={agentListData} renderItem={gridRender} />
      <AgentModal />
    </>
  );
});

export default GridCard;
