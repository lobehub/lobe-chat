import { LocalFileItem } from '@lobechat/electron-client-ipc';
import { BuiltinRenderProps } from '@lobechat/types';
import { memo } from 'react';

import { LocalSystemApiName } from '@/tools/local-system';

import ListFiles from './ListFiles';
import ReadLocalFile from './ReadLocalFile';
import RenameLocalFile from './RenameLocalFile';
import SearchFiles from './SearchFiles';
import WriteFile from './WriteFile';

const RenderMap = {
  [LocalSystemApiName.searchLocalFiles]: SearchFiles,
  [LocalSystemApiName.listLocalFiles]: ListFiles,
  [LocalSystemApiName.readLocalFile]: ReadLocalFile,
  [LocalSystemApiName.renameLocalFile]: RenameLocalFile,
  [LocalSystemApiName.writeLocalFile]: WriteFile,
};

const LocalFilesRender = memo<BuiltinRenderProps<LocalFileItem[]>>(
  ({ pluginState, apiName, messageId, pluginError, args }) => {
    const Render = RenderMap[apiName as any];

    if (!Render) return;

    return (
      <Render
        args={args}
        messageId={messageId}
        pluginError={pluginError}
        pluginState={pluginState}
      />
    );
  },
);

LocalFilesRender.displayName = 'LocalFilesRender';

export default LocalFilesRender;
