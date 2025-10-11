import { ChatToolPayload } from '@lobechat/types';
import { safeParseJSON } from '@lobechat/utils';
import debug from 'debug';

import { SearchService } from '@/server/services/search';

import { IToolExecutor, ToolExecutionContext, ToolExecutionResult } from './types';

const log = debug('lobe-server:builtin-tools-executor');

export class BuiltinToolsExecutor implements IToolExecutor {
  constructor(private searchService: SearchService) {}

  async execute(
    payload: ChatToolPayload,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    const { identifier, apiName, arguments: argsStr } = payload;
    const args = safeParseJSON(argsStr) || {};

    log('Executing builtin tool: %s:%s with args: %O', identifier, apiName, args, context);

    try {
      switch (identifier) {
        case 'lobe-web-browsing': {
          return await this.executeWebBrowsing(apiName, args);
        }

        default: {
          throw new Error(`Builtin tool "${identifier}" is not implemented`);
        }
      }
    } catch (error) {
      log('Error executing builtin tool %s:%s: %O', identifier, apiName, error);

      return {
        content: (error as Error).message,
        error: {
          message: (error as Error).message,
        },
        success: false,
      };
    }
  }

  private async executeWebBrowsing(apiName: string, args: any): Promise<ToolExecutionResult> {
    switch (apiName) {
      case 'search': {
        const result = await this.searchService.query(args.query, {
          searchCategories: args.searchCategories,
          searchEngines: args.searchEngines,
          searchTimeRange: args.searchTimeRange,
        });
        return { content: JSON.stringify(result.results), state: result, success: true };
      }

      case 'crawlSinglePage': {
        const { results: res } = await this.searchService.crawlPages({
          urls: [args.url],
        });

        const result = res[0];

        if ('errorMessage' in result.data) {
          return {
            content: result.data.errorMessage!,
            error: result.data,
            state: result,
            success: false,
          };
        }

        return { content: result.data.content!, state: result, success: true };
      }

      case 'crawlMultiPages': {
        const { results } = await this.searchService.crawlPages({
          urls: args.urls,
        });

        return {
          content: results.map((item) => item.data.content).join('/n/n'),
          state: results,
          success: true,
        };
      }

      default: {
        throw new Error(`Web browsing API "${apiName}" is not supported`);
      }
    }
  }
}
