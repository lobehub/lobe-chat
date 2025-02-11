'use client';

import { ModelIcon } from '@lobehub/icons';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox, FlexboxProps } from 'react-layout-kit';
import urlJoin from 'url-join';

import { OFFICIAL_URL } from '@/const/url';
import { DiscoverModelItem, DiscoverProviderItem } from '@/types/discover';

import ModelFeatureTags from '../../../../features/ModelFeatureTags';
import ShareButton from '../../../features/ShareButton';
import ChatWithModel from './ChatWithModel';

interface ModelActionsProps extends FlexboxProps {
  data: DiscoverModelItem;
  identifier: string;
  providerData: DiscoverProviderItem[];
}

const ModelActions = memo<ModelActionsProps>(({ identifier, providerData, data }) => {
  const { t } = useTranslation('models');
  return (
    <Flexbox align={'center'} gap={8} horizontal>
      <ChatWithModel providerData={providerData} providers={data.providers} />
      <ShareButton
        meta={{
          avatar: <ModelIcon model={identifier} size={64} type={'avatar'} />,
          desc: data.meta.description && t(`${identifier}.description`),
          tags: (
            <ModelFeatureTags
              functionCall={data.meta.functionCall}
              tokens={data.meta.contextWindowTokens}
              vision={data.meta.vision}
            />
          ),
          title: data.meta.title,
          url: urlJoin(OFFICIAL_URL, '/discover/model', identifier),
        }}
      />
    </Flexbox>
  );
});

export default ModelActions;
