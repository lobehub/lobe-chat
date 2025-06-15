'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { OFFICIAL_URL } from '@/const/url';

import ShareButton from '../../../../../features/ShareButton';
import { useDetailContext } from '../../DetailProvider';
import AddPlugin from './AddPlugin';

const ActionButton = memo(() => {
  const { avatar, description, tags, title, identifier } = useDetailContext();
  return (
    <Flexbox align={'center'} gap={8} horizontal>
      <AddPlugin />
      <ShareButton
        meta={{
          avatar: avatar,
          desc: description,
          hashtags: tags,
          title: title,
          url: urlJoin(OFFICIAL_URL, '/discover/plugin', identifier as string),
        }}
      />
    </Flexbox>
  );
});

export default ActionButton;
