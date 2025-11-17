import qs from 'query-string';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useQuery } from '@/hooks/useQuery';
import { AssistantMarketSource } from '@/types/discover';

import McpList from '../../../../../(list)/assistant/features/List';
import Title from '../../../../../features/Title';
import { useDetailContext } from '../../DetailProvider';

const Related = memo(() => {
  const { t } = useTranslation('discover');
  const { related, category } = useDetailContext();
  const { source } = useQuery() as { source?: AssistantMarketSource };
  const marketSource = source === 'legacy' ? 'legacy' : undefined;
  return (
    <Flexbox gap={16}>
      <Title
        more={t('assistants.details.related.more')}
        moreLink={qs.stringifyUrl(
          {
            query: {
              category,
              source: marketSource,
            },
            url: '/discover/assistant',
          },
          { skipNull: true },
        )}
      >
        {t('assistants.details.related.listTitle')}
      </Title>
      <McpList data={related} />
    </Flexbox>
  );
});

export default Related;
