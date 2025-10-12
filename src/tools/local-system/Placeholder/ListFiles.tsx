import { ListLocalFileParams } from '@lobechat/electron-client-ipc';
import { Skeleton } from 'antd';
import React, { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LocalFolder } from '@/features/LocalFile';

interface ListFilesProps {
  args: ListLocalFileParams;
}
export const ListFiles = memo<ListFilesProps>(({ args }) => {
  return (
    <Flexbox gap={8}>
      <LocalFolder path={args.path} />
      <Flexbox gap={4}>
        <Skeleton.Button active block style={{ height: 16 }} />
        <Skeleton.Button active block style={{ height: 16 }} />
        <Skeleton.Button active block style={{ height: 16 }} />
        <Skeleton.Button active block style={{ height: 16 }} />
      </Flexbox>
    </Flexbox>
  );
});
