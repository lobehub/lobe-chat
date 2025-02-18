'use client';

import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';
import urlJoin from 'url-join';

import { OFFICIAL_URL } from '@/const/url';
import { DiscoverPlugintem } from '@/types/discover';

import ShareButton from '../../../features/ShareButton';
import InstallTool from './InstallPlugin';

interface PluginActionsProps extends FlexboxProps {
  data: DiscoverPlugintem;
  identifier: string;
}

const PluginActions = memo<PluginActionsProps>(({ identifier, data }) => {
  return (
    <Flexbox align={'center'} gap={8} horizontal>
      <InstallTool identifier={identifier} />
      <ShareButton
        meta={{
          avatar: data.meta.avatar,
          desc: data.meta.description,
          hashtags: data.meta.tags,
          title: data.meta.title,
          url: urlJoin(OFFICIAL_URL, '/discover/plugin', identifier),
        }}
      />
    </Flexbox>
  );
});

export default PluginActions;
