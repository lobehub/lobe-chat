import { LocalSystemApiName } from '@lobechat/builtin-tool-local-system';

import { EditLocalFileInspector } from './EditLocalFile';
import { ReadLocalFileInspector } from './ReadLocalFile';
import { RunCommandInspector } from './RunCommand';

/**
 * Local System Inspector Components Registry
 */
export const LocalSystemInspectors = {
  [LocalSystemApiName.editLocalFile]: EditLocalFileInspector,
  [LocalSystemApiName.readLocalFile]: ReadLocalFileInspector,
  [LocalSystemApiName.runCommand]: RunCommandInspector,
};
