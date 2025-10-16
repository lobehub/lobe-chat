import { ChatToolPayload } from '@lobechat/types';
import { safeParseJSON } from '@lobechat/utils';
import { PluginRequestPayload } from '@lobehub/chat-plugin-sdk';
import { Gateway, GatewaySuccessResponse } from '@lobehub/chat-plugins-gateway';
import debug from 'debug';

import { parserPluginSettings } from '@/app/(backend)/webapi/plugin/gateway/settings';
import { getAppConfig } from '@/envs/app';
import { ToolExecutionContext } from '@/server/services/toolExecution/types';

const log = debug('lobe-server:plugin-gateway-service');

export class PluginGatewayService {
  private gateway: Gateway;

  constructor() {
    const { PLUGINS_INDEX_URL, PLUGIN_SETTINGS } = getAppConfig();

    this.gateway = new Gateway({
      defaultPluginSettings: parserPluginSettings(PLUGIN_SETTINGS),
      pluginsIndexUrl: PLUGINS_INDEX_URL,
    });
  }

  async execute(payload: ChatToolPayload, context: ToolExecutionContext) {
    const { identifier, apiName, arguments: argsStr } = payload;
    const args = safeParseJSON(argsStr) || {};

    log('Executing plugin: %s:%s with args: %O', identifier, apiName, args, context);

    try {
      // Construct plugin request
      const requestBody: PluginRequestPayload = {
        apiName,
        arguments: JSON.stringify(args),
        identifier,
        manifest: context.toolManifestMap[identifier] as any,
      };

      const response = await this.gateway.execute(requestBody);

      log('Plugin execution result: %O', response);

      return {
        content: (response as GatewaySuccessResponse).data,
        success: true,
      };
    } catch (error) {
      console.error('Error executing plugin %s:%s: %O', identifier, apiName, error);
      return {
        content: (error as Error).message,
        error: {
          message: (error as Error).message,
        },
        success: false,
      };
    }
  }
}
