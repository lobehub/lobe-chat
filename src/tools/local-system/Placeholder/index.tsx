import { BuiltinPlaceholderProps } from '@lobechat/types';
import { memo } from 'react';

import { LocalSystemApiName } from '@/tools/local-system';

import { ListFiles } from './ListFiles';
import ReadLocalFile from './ReadLocalFile';
import SearchFiles from './SearchFiles';

const RenderMap = {
  [LocalSystemApiName.searchLocalFiles]: SearchFiles,
  [LocalSystemApiName.listLocalFiles]: ListFiles,
  [LocalSystemApiName.readLocalFile]: ReadLocalFile,
  // [LocalSystemApiName.renameLocalFile]: RenameLocalFile,
  // [LocalSystemApiName.writeLocalFile]: WriteFile,
};
const Placeholder = memo<BuiltinPlaceholderProps>(({ apiName, args }) => {
  const Render = RenderMap[apiName as any];

  if (!Render) return;

  return <Render args={(args || {}) as any} />;
});

export default Placeholder;
