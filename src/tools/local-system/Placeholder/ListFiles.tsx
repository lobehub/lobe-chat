import { ListLocalFileParams } from '@lobechat/electron-client-ipc';
import { BuiltinPlaceholderProps } from '@lobechat/types';
import { Skeleton } from 'antd';
import React, { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { LocalFolder } from '@/features/LocalFile';

export const ListFiles = memo<BuiltinPlaceholderProps<ListLocalFileParams>>(({ args }) => {
  return (
    <Flexbox gap={12}>
      {args?.path && <LocalFolder path={args.path} />}
      <Center height={140}>
        <Flexbox gap={4} width={'90%'}>
          <Skeleton.Button active block style={{ height: 16 }} />
          <Skeleton.Button active block style={{ height: 16 }} />
          <Skeleton.Button active block style={{ height: 16 }} />
          <Skeleton.Button active block style={{ height: 16 }} />
        </Flexbox>
      </Center>
    </Flexbox>
  );
});
