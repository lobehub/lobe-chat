import { ListLocalFileParams } from '@lobechat/electron-client-ipc';
import { BuiltinRenderProps } from '@lobechat/types';
import React, { memo } from 'react';

import { LocalFolder } from '@/features/LocalFile';

import { LocalFileListState } from '../../type';
import SearchResult from './Result';

const ListFiles = memo<BuiltinRenderProps<ListLocalFileParams, LocalFileListState>>(
  ({ messageId, pluginError, args, pluginState }) => {
    return (
      <>
        <LocalFolder path={args.path} />
        <SearchResult
          listResults={pluginState?.listResults}
          messageId={messageId}
          pluginError={pluginError}
        />
      </>
    );
  },
);

ListFiles.displayName = 'ListFiles';

export default ListFiles;
