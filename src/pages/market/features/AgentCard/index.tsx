import { SpotlightCard } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';

import { selectors, useMarketStore } from '@/store/market';

import TagList from '../TagList';
import AgentCardItem from './AgentCardItem';
import Loading from './Loading';

const gridRender = (item: any) => <AgentCardItem {...item} />;

const AgentCard = memo(() => {
  const agentList = useMarketStore(selectors.getAgentList, isEqual);

  const [useFetchAgentList, keywords] = useMarketStore((s) => [
    s.useFetchAgentList,
    s.searchKeywords,
  ]);

  const { isLoading } = useFetchAgentList();

  const agentListData = useMemo(() => {
    if (!keywords) return agentList;
    return agentList.filter(({ meta }) => JSON.stringify(meta).toLowerCase().includes(keywords));
  }, [agentList, keywords]);

  if (isLoading || !agentList) return <Loading />;

  return (
    <>
      <TagList />
      <SpotlightCard items={agentListData} renderItem={gridRender} />
    </>
  );
});

export default AgentCard;
