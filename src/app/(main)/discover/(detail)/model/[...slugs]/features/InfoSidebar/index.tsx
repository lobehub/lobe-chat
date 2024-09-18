'use client';

import { Skeleton } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox, FlexboxProps } from 'react-layout-kit';
import urlJoin from 'url-join';

import InterceptingLink from '@/components/InterceptingLink';
import { DiscoverModelItem } from '@/types/discover';

import Block from '../../../../features/Block';
import SuggestionItem from './SuggestionItem';

interface InfoSidebarProps extends FlexboxProps {
  data: DiscoverModelItem;
  identifier: string;
  mobile?: boolean;
}

const InfoSidebar = memo<InfoSidebarProps>(({ data, ...rest }) => {
  const { t } = useTranslation('discover');

  return (
    <Flexbox gap={48} style={{ position: 'relative' }} width={'100%'} {...rest}>
      <Block
        gap={24}
        more={t('models.more')}
        moreLink={urlJoin('/discover/models', data.meta?.category || '')}
        title={t('models.suggestions')}
      >
        {data?.suggestions?.length > 0 ? (
          data?.suggestions.map((item) => (
            <InterceptingLink
              href={urlJoin('/discover/model', item.identifier)}
              key={item.identifier}
            >
              <SuggestionItem {...item} />
            </InterceptingLink>
          ))
        ) : (
          <Skeleton active paragraph={{ rows: 5 }} title={false} />
        )}
      </Block>
    </Flexbox>
  );
});

export default InfoSidebar;
