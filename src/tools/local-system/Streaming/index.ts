import { LocalSystemApiName } from '@lobechat/builtin-tool-local-system';

import { RunCommandStreaming } from './RunCommand';

/**
 * Local System Streaming Components Registry
 */
export const LocalSystemStreamings = {
  [LocalSystemApiName.runCommand]: RunCommandStreaming,
};
