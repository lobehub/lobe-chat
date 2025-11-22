import { ChatToolPayload } from '@lobechat/types';
import { safeParseJSON } from '@lobechat/utils';
import debug from 'debug';

import { SearchService } from '@/server/services/search';
import { BuiltinToolServerRuntimes } from '@/tools/executionRuntimes';

import { IToolExecutor, ToolExecutionContext, ToolExecutionResult } from './types';

const log = debug('lobe-server:builtin-tools-executor');

export class BuiltinToolsExecutor implements IToolExecutor {
  async execute(
    payload: ChatToolPayload,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    const { identifier, apiName, arguments: argsStr } = payload;
    const args = safeParseJSON(argsStr) || {};

    log('Executing builtin tool: %s:%s with args: %O', identifier, apiName, args, context);

    const ServerRuntime = BuiltinToolServerRuntimes[identifier];

    if (!ServerRuntime) {
      throw new Error(`Builtin tool "${identifier}" is not implemented`);
    }

    const runtime = new ServerRuntime({
      searchService: new SearchService(),
    });

    if (!runtime[apiName]) {
      throw new Error(`Builtin tool ${identifier} 's ${apiName} is not implemented`);
    }

    try {
      return await runtime[apiName](args);
    } catch (e) {
      const error = e as Error;
      console.error('Error executing builtin tool %s:%s: %O', identifier, apiName, error);

      return { content: error.message, error: error, success: false };
    }
  }
}
