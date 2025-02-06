'use client';

import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';
import urlJoin from 'url-join';

import { OFFICIAL_URL } from '@/const/url';
import { DiscoverAssistantItem } from '@/types/discover';

import ShareButton from '../../../features/ShareButton';
import AddAgent from './AddAgent';

interface AssistantActionProps extends FlexboxProps {
  data: DiscoverAssistantItem;
  identifier: string;
}

const AssistantAction = memo<AssistantActionProps>(({ identifier, data }) => {
  return (
    <Flexbox align={'center'} gap={8} horizontal>
      <AddAgent data={data} />
      <ShareButton
        meta={{
          avatar: data.meta.avatar,
          desc: data.meta.description,
          hashtags: data.meta.tags,
          title: data.meta.title,
          url: urlJoin(OFFICIAL_URL, '/discover/assistant', identifier),
        }}
      />
    </Flexbox>
  );
});

export default AssistantAction;
