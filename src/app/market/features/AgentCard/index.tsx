import { SpotlightCard } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { shuffle } from 'lodash-es';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { agentMarketSelectors, useMarketStore } from '@/store/market';
import { AgentsMarketIndexItem } from '@/types/market';

import TagList from '../TagList';
import AgentCardItem from './AgentCardItem';
import Loading from './Loading';
import { useStyles } from './style';

const gridRender = (item: any) => <AgentCardItem {...item} />;

export interface AgentCardProps {
  defaultAgents?: AgentsMarketIndexItem[];
}

const AgentCard = memo<AgentCardProps>(({ defaultAgents }) => {
  const { t } = useTranslation('market');
  const { mobile } = useResponsive();
  const clientAgentList = useMarketStore(agentMarketSelectors.getAgentList);

  const agentList = clientAgentList.length === 0 && defaultAgents ? defaultAgents : clientAgentList;

  const [useFetchAgentList, keywords] = useMarketStore((s) => [
    s.useFetchAgentList,
    s.searchKeywords,
  ]);
  const { styles } = useStyles();
  const { isLoading } = useFetchAgentList();

  const agentListData = useMemo(() => {
    if (!keywords) return agentList;
    return agentList.filter(({ meta }) => JSON.stringify(meta).toLowerCase().includes(keywords));
  }, [agentList, keywords]);

  if (isLoading || !agentList) return <Loading />;

  return (
    <Flexbox gap={mobile ? 16 : 24}>
      <TagList />
      {keywords ? (
        <SpotlightCard items={agentListData} renderItem={gridRender} spotlight={false} />
      ) : (
        <>
          <div className={styles.subTitle}>{t('title.recentSubmits')}</div>
          <SpotlightCard items={agentListData.slice(0, 3)} renderItem={gridRender} />
          <div className={styles.subTitle}>{t('title.allAgents')}</div>
          <SpotlightCard
            items={shuffle(agentListData.slice(3))}
            renderItem={gridRender}
            spotlight={false}
          />
        </>
      )}
    </Flexbox>
  );
});

export default AgentCard;
