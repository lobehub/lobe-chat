'use client';

import { SpotlightCard, SpotlightCardProps } from '@lobehub/ui';
import { Empty, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { isEqual } from 'lodash-es';
import { memo, useCallback, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LazyLoad from 'react-lazy-load';

import { agentMarketSelectors, useMarketStore } from '@/store/market';

import AgentCard from './AgentCard';

const useStyles = createStyles(({ css, responsive }) => ({
  lazy: css`
    min-height: 232px;
  `,
  title: css`
    margin-top: 0.5em;
    font-size: 24px;
    font-weight: 600;
    ${responsive.mobile} {
      font-size: 20px;
    }
  `,
}));

export interface AgentListProps {
  keywords?: string;
  mobile?: boolean;
}

const AgentList = memo<AgentListProps>(({ mobile, keywords }) => {
  const { t } = useTranslation('market');
  const useFetchAgentList = useMarketStore((s) => s.useFetchAgentList);
  const { isLoading } = useFetchAgentList();
  const agentList = useMarketStore(agentMarketSelectors.getAgentList(keywords), isEqual);
  const { styles } = useStyles();

  useLayoutEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useMarketStore.persist.rehydrate();
  }, []);

  const GridRender: SpotlightCardProps['renderItem'] = useCallback(
    (props: any) => (
      <LazyLoad className={styles.lazy}>
        <AgentCard {...props} />
      </LazyLoad>
    ),
    [],
  );

  if (isLoading) return <Skeleton paragraph={{ rows: 8 }} title={false} />;

  if (keywords) {
    if (agentList.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return <SpotlightCard items={agentList} renderItem={GridRender} spotlight={!mobile} />;
  }

  return (
    <>
      <h2 className={styles.title}>{t('title.recentSubmits')}</h2>
      <SpotlightCard items={agentList.slice(0, 3)} renderItem={GridRender} spotlight={!mobile} />
      <h2 className={styles.title}>{t('title.allAgents')}</h2>
      <SpotlightCard items={agentList.slice(3)} renderItem={GridRender} spotlight={false} />
    </>
  );
});

AgentList.displayName = 'AgentList';

export default AgentList;
