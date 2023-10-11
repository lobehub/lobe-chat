import { useResponsive } from 'antd-style';
import dynamic from 'next/dynamic';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { agentMarketSelectors, useMarketStore } from '@/store/market';
import { AgentsMarketIndexItem } from '@/types/market';

import TagList from '../TagList';
import AgentCardItem from './AgentCardItem';
import Loading from './Loading';
import { useStyles } from './style';

const AgentCardMobile = dynamic(() => import('../../(mobile)/features/AgentCard'));
const AgentCardDesktop = dynamic(() => import('@lobehub/ui/es/SpotlightCard'));

const gridRender = (item: any) => <AgentCardItem {...item} />;

export interface AgentCardProps {
  defaultAgents?: AgentsMarketIndexItem[];
}

const AgentCard = memo<AgentCardProps>(({ defaultAgents }) => {
  const { t } = useTranslation('market');
  const { mobile } = useResponsive();
  const { styles } = useStyles();

  const [useFetchAgentList, keywords] = useMarketStore((s) => [
    s.useFetchAgentList,
    s.searchKeywords,
  ]);
  useFetchAgentList();

  const clientAgentList = useMarketStore(agentMarketSelectors.getAgentList);
  const agentList = clientAgentList.length === 0 && defaultAgents ? defaultAgents : clientAgentList;

  const agentListData = useMemo(() => {
    if (!keywords) return agentList;
    return agentList.filter(({ meta }) => JSON.stringify(meta).toLowerCase().includes(keywords));
  }, [agentList, keywords]);

  if (agentList.length === 0) return <Loading />;

  const CardRender = mobile ? AgentCardMobile : AgentCardDesktop;

  return (
    <Flexbox gap={mobile ? 16 : 24}>
      <TagList />
      {keywords ? (
        <CardRender items={agentListData} renderItem={gridRender} spotlight={false} />
      ) : (
        <>
          <div className={styles.subTitle}>{t('title.recentSubmits')}</div>
          <CardRender items={agentListData.slice(0, 3)} renderItem={gridRender} />
          <div className={styles.subTitle}>{t('title.allAgents')}</div>
          <CardRender items={agentListData.slice(3)} renderItem={gridRender} spotlight={false} />
        </>
      )}
    </Flexbox>
  );
});

export default AgentCard;
