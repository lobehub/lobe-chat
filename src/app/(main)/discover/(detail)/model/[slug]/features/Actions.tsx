'use client';

import { ModelIcon } from '@lobehub/icons';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';
import urlJoin from 'url-join';

import Tags from '@/app/(main)/discover/(detail)/model/[slug]/features/Tags';
import { OFFICIAL_URL } from '@/const/url';
import { DiscoverModelItem } from '@/types/discover';

import ShareButton from '../../../features/ShareButton';
import ChatWithModel from './ChatWithModel';

interface ModelActionsProps extends FlexboxProps {
  data: DiscoverModelItem;
  identifier: string;
}

const ModelActions = memo<ModelActionsProps>(({ identifier, data }) => {
  return (
    <Flexbox align={'center'} gap={8} horizontal>
      <ChatWithModel providers={data.providers} />
      <ShareButton
        meta={{
          avatar: <ModelIcon model={identifier} size={64} type={'avatar'} />,
          desc: data.meta.description,
          tags: (
            <Tags
              functionCall={data.meta.functionCall}
              tokens={data.meta.tokens}
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
