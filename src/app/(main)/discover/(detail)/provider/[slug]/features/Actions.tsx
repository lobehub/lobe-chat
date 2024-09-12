'use client';

import { ModelTag, ProviderIcon } from '@lobehub/icons';
import { Tag } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox, FlexboxProps } from 'react-layout-kit';
import urlJoin from 'url-join';

import { OFFICIAL_URL } from '@/const/url';
import { DiscoverProviderItem } from '@/types/discover';

import ShareButton from '../../../features/ShareButton';
import ProviderConfig from './ProviderConfig';

interface ModelActionsProps extends FlexboxProps {
  data: DiscoverProviderItem;
  identifier: string;
}

const ProviderActions = memo<ModelActionsProps>(({ identifier, data }) => {
  const { t } = useTranslation('providers');
  return (
    <Flexbox align={'center'} gap={8} horizontal width={'100%'}>
      <ProviderConfig data={data} identifier={identifier} />
      <ShareButton
        meta={{
          avatar: <ProviderIcon provider={identifier} size={64} type={'avatar'} />,
          desc: data.meta.description && t(`${identifier}.description`),
          tags: (
            <Flexbox align={'center'} gap={4} horizontal justify={'center'} wrap={'wrap'}>
              {data.models
                .slice(0, 4)
                .filter(Boolean)
                .map((tag: string, index) => (
                  <ModelTag key={index} model={tag} style={{ margin: 0 }} />
                ))}
              {data.models.length > 3 && <Tag>+{data.models.length - 3}</Tag>}
            </Flexbox>
          ),
          title: data.meta.title,
          url: urlJoin(OFFICIAL_URL, '/discover/provider', identifier),
        }}
      />
    </Flexbox>
  );
});

export default ProviderActions;
