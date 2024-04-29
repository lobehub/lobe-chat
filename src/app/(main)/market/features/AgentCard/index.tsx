import { SpotlightCardProps } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import LazyLoad from 'react-lazy-load';

import { agentMarketSelectors, useMarketStore } from '@/store/market';

import Loading from '../../components/Loading';
import TagList from '../TagList';
import AgentCardItem from './AgentCardItem';
import { useStyles } from './style';

export interface AgentCardProps {
  CardRender: FC<SpotlightCardProps>;
  mobile?: boolean;
}

const AgentCard = memo<AgentCardProps>(({ CardRender, mobile }) => {
  const { t } = useTranslation('market');
  const [useFetchAgentList, keywords] = useMarketStore((s) => [
    s.useFetchAgentList,
    s.searchKeywords,
  ]);
  const { isLoading } = useFetchAgentList();
  const agentList = useMarketStore(agentMarketSelectors.getAgentList, isEqual);
  const { styles } = useStyles();

  const GridRender: SpotlightCardProps['renderItem'] = useCallback(
    (props: any) => (
      <LazyLoad className={styles.lazy}>
        <AgentCardItem {...props} />
      </LazyLoad>
    ),
    [styles.lazy],
  );

  if (isLoading) return <Loading />;

  return (
    <Flexbox gap={mobile ? 16 : 24}>
      <TagList />
      {keywords ? (
        <CardRender
          items={agentList}
          renderItem={GridRender}
          spotlight={mobile ? undefined : false}
        />
      ) : (
        <>
          <div className={styles.subTitle}>{t('title.recentSubmits')}</div>
          <CardRender items={agentList.slice(0, 3)} renderItem={GridRender} />
          <div className={styles.subTitle}>{t('title.allAgents')}</div>
          <CardRender items={agentList.slice(3)} renderItem={GridRender} />
        </>
      )}
    </Flexbox>
  );
});

export default AgentCard;
