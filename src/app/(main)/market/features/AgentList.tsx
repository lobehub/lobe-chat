'use client';

import { Grid, SpotlightCardProps } from '@lobehub/ui';
import { Empty, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LazyLoad from 'react-lazy-load';

import { agentMarketSelectors, useMarketStore } from '@/store/market';

import AgentCard from './AgentCard';

const useStyles = createStyles(({ css, responsive }) => ({
  compactLazy: css`
    min-height: 120px;
  `,
  lazy: css`
    min-height: 332px;
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
  mobile?: boolean;
}

const AgentList = memo<AgentListProps>(({ mobile }) => {
  const { t } = useTranslation('market');
  const [searchKeywords, useFetchAgentList] = useMarketStore((s) => [
    s.searchKeywords,
    s.useFetchAgentList,
  ]);
  const { isLoading } = useFetchAgentList();
  const agentList = useMarketStore(agentMarketSelectors.getAgentList, isEqual);
  const { styles } = useStyles();
  const recentLength = mobile ? 3 : 6;

  useLayoutEffect(() => {
    // refs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#hashydrated
    useMarketStore.persist.rehydrate();
  }, []);

  const GridCompactRender: SpotlightCardProps['renderItem'] = useCallback(
    (props: any) => (
      <LazyLoad className={styles.compactLazy} offset={332}>
        <AgentCard variant={'compact'} {...props} />
      </LazyLoad>
    ),
    [],
  );

  if (isLoading) return <Skeleton paragraph={{ rows: 8 }} title={false} />;

  if (searchKeywords) {
    if (agentList.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <Grid rows={3}>
        {agentList.map((item) => (
          <GridCompactRender key={item.identifier} {...item} />
        ))}
      </Grid>
    );
  }

  return (
    <>
      <h2 className={styles.title}>{t('title.recentSubmits')}</h2>
      <Grid rows={3}>
        {agentList.slice(0, recentLength).map((item) => (
          <AgentCard key={item.identifier} {...item} />
        ))}
      </Grid>
      <h2 className={styles.title}>{t('title.allAgents')}</h2>
      <Grid rows={3}>
        {agentList.slice(recentLength).map((item) => (
          <GridCompactRender key={item.identifier} {...item} />
        ))}
      </Grid>
    </>
  );
});

AgentList.displayName = 'AgentList';

export default AgentList;
