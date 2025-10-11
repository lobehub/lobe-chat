import { PLUGIN_SCHEMA_API_MD5_PREFIX, PLUGIN_SCHEMA_SEPARATOR } from '@lobechat/const';
import { ChatToolPayload, MessageToolCall } from '@lobechat/types';
import { genToolCallShortMD5Hash } from '@lobechat/utils';
import { LobeChatPluginApi, LobePluginType, PluginSchema } from '@lobehub/chat-plugin-sdk';

interface ToolManifest {
  api: LobeChatPluginApi[];
  identifier: string;
  openapi?: string;
  settings?: PluginSchema;
  systemRole?: string;
  type?: LobePluginType;
}

export const transformerToolsCalling = (
  toolCalls: MessageToolCall[],
  manifests: Record<string, ToolManifest>,
): ChatToolPayload[] => {
  return toolCalls
    .map((toolCall): ChatToolPayload | null => {
      let payload: ChatToolPayload;

      const [identifier, apiName, type] = toolCall.function.name.split(PLUGIN_SCHEMA_SEPARATOR);

      if (!apiName) return null;

      payload = {
        apiName,
        arguments: toolCall.function.arguments,
        id: toolCall.id,
        identifier,
        type: (type ?? 'default') as any,
      };

      // if the apiName is md5, try to find the correct apiName in the plugins
      if (apiName.startsWith(PLUGIN_SCHEMA_API_MD5_PREFIX) && manifests[identifier]) {
        const md5 = apiName.replace(PLUGIN_SCHEMA_API_MD5_PREFIX, '');
        const manifest = manifests[identifier];

        const api = manifest?.api.find((api) => genToolCallShortMD5Hash(api.name) === md5);
        if (api) {
          payload.apiName = api.name;
        }
      }

      return payload;
    })
    .filter(Boolean) as ChatToolPayload[];
};
