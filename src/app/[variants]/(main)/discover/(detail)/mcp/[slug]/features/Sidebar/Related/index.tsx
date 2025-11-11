import NextLink from 'next/link';
import qs from 'query-string';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';
import urlJoin from 'url-join';

import { useDetailContext } from '@/features/MCPPluginDetail/DetailProvider';

import Title from '../../../../../../features/Title';
import Item from './Item';

const Related = memo(() => {
  const { t } = useTranslation('discover');
  const { related, category } = useDetailContext();
  const navigate = useNavigate();

  return (
    <Flexbox gap={16}>
      <Title
        more={t('mcp.details.related.more')}
        moreLink={qs.stringifyUrl({
          query: {
            category,
          },
          url: '/discover/mcp',
        })}
      >
        {t('mcp.details.related.listTitle')}
      </Title>
      <Flexbox gap={8}>
        {related?.map((item, index) => {
          const link = urlJoin('/mcp', item.identifier);
          return (
            <NextLink
              href={urlJoin('/discover/mcp', item.identifier)}
              key={index}
              onClick={(e) => {
                e.preventDefault();
                navigate(link);
              }}
              style={{ color: 'inherit', overflow: 'hidden' }}
            >
              <Item {...item} />
            </NextLink>
          );
        })}
      </Flexbox>
    </Flexbox>
  );
});

export default Related;
