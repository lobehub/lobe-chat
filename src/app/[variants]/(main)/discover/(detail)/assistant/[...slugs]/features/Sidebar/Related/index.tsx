import Link from 'next/link';
import qs from 'query-string';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import Title from '../../../../../../features/Title';
import { useQuery } from '@/hooks/useQuery';
import { AssistantMarketSource } from '@/types/discover';
import { useDetailContext } from '../../DetailProvider';
import Item from './Item';

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
      <Flexbox gap={8}>
        {related?.map((item, index) => {
          const link = qs.stringifyUrl(
            {
              query: marketSource ? { source: marketSource } : undefined,
              url: urlJoin('/discover/assistant', item.identifier),
            },
            { skipNull: true },
          );
          return (
            <Link href={link} key={index} style={{ color: 'inherit', overflow: 'hidden' }}>
              <Item {...item} />
            </Link>
          );
        })}
      </Flexbox>
    </Flexbox>
  );
});

export default Related;
