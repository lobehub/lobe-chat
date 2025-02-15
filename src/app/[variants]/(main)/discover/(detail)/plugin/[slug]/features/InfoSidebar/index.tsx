'use client';

import { Skeleton } from 'antd';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { DiscoverPlugintem } from '@/types/discover';

import Block from '../../../../features/Block';
import SuggestionItem from './SuggestionItem';

interface InfoSidebarProps {
  data: DiscoverPlugintem;
  identifier: string;
}

const InfoSidebar = memo<InfoSidebarProps>(({ data }) => {
  const { t } = useTranslation('discover');

  return (
    <Flexbox gap={48} style={{ position: 'relative' }} width={'100%'}>
      <Block
        gap={24}
        more={t('assistants.more')}
        moreLink={urlJoin('/discover/plugins', data.meta?.category || '')}
        title={t('assistants.suggestions')}
      >
        {data?.suggestions?.length > 0 ? (
          data?.suggestions.map((item) => (
            <Link href={urlJoin('/discover/plugin', item.identifier)} key={item.identifier}>
              <SuggestionItem {...item} />
            </Link>
          ))
        ) : (
          <Skeleton active paragraph={{ rows: 5 }} title={false} />
        )}
      </Block>
    </Flexbox>
  );
});

export default InfoSidebar;
