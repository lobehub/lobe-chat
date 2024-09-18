'use client';

import { Skeleton } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox, FlexboxProps } from 'react-layout-kit';
import urlJoin from 'url-join';

import InterceptingLink from '@/components/InterceptingLink';
import { DiscoverAssistantItem, DiscoverPlugintem } from '@/types/discover';

import Block from '../../../../features/Block';
import SuggestionItem from './SuggestionItem';
import ToolItem from './ToolItem';

interface InfoSidebarProps extends FlexboxProps {
  data: DiscoverAssistantItem;
  identifier: string;
  mobile?: boolean;
  pluginData?: DiscoverPlugintem[];
}

const InfoSidebar = memo<InfoSidebarProps>(({ pluginData, data, ...rest }) => {
  const { t } = useTranslation('discover');

  return (
    <Flexbox gap={48} style={{ position: 'relative' }} width={'100%'} {...rest}>
      {pluginData && pluginData?.length > 0 && (
        <Block gap={12} title={t('assistants.plugins')}>
          {pluginData.map((item) => (
            <InterceptingLink
              href={urlJoin('/discover/plugin', item.identifier)}
              key={item.identifier}
              style={{ color: 'inherit' }}
            >
              <ToolItem {...item} />
            </InterceptingLink>
          ))}
        </Block>
      )}
      <Block
        gap={24}
        more={t('assistants.more')}
        moreLink={urlJoin('/discover/assistants', data.meta?.category || '')}
        title={t('assistants.suggestions')}
      >
        {data?.suggestions?.length > 0 ? (
          data?.suggestions.map((item) => (
            <InterceptingLink
              href={urlJoin('/discover/assistant', item.identifier)}
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
