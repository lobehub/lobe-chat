/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { ChatToolPayload } from '@lobechat/types';
import { PluginErrorType } from '@lobehub/chat-plugin-sdk';
import { t } from 'i18next';
import { StateCreator } from 'zustand/vanilla';

import { MCPToolCallResult } from '@/libs/mcp';
import { chatService } from '@/services/chat';
import { mcpService } from '@/services/mcp';
import { messageService } from '@/services/message';
import { ChatStore } from '@/store/chat/store';
import { useToolStore } from '@/store/tool';
import { safeParseJSON } from '@/utils/safeParseJSON';
import { setNamespace } from '@/utils/storeDebug';

import { dbMessageSelectors } from '../../message/selectors';

const n = setNamespace('plugin');

/**
 * Plugin type-specific implementations
 * Each method handles a specific type of plugin invocation
 */
export interface PluginTypesAction {
  /**
   * Invoke builtin tool
   */
  invokeBuiltinTool: (id: string, payload: ChatToolPayload) => Promise<void>;

  /**
   * Invoke default type plugin (returns data)
   */
  invokeDefaultTypePlugin: (id: string, payload: any) => Promise<string | undefined>;

  /**
   * Invoke markdown type plugin
   */
  invokeMarkdownTypePlugin: (id: string, payload: ChatToolPayload) => Promise<void>;

  /**
   * Invoke MCP type plugin
   */
  invokeMCPTypePlugin: (id: string, payload: ChatToolPayload) => Promise<string | undefined>;

  /**
   * Invoke standalone type plugin
   */
  invokeStandaloneTypePlugin: (id: string, payload: ChatToolPayload) => Promise<void>;

  /**
   * Internal method to call plugin API
   */
  internal_callPluginApi: (id: string, payload: ChatToolPayload) => Promise<string | undefined>;
}

export const pluginTypes: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  PluginTypesAction
> = (set, get) => ({
  invokeBuiltinTool: async (id, payload) => {
    // run tool api call
    // @ts-ignore
    const { [payload.apiName]: action } = get();
    if (!action) return;

    const content = safeParseJSON(payload.arguments);

    if (!content) return;

    return await action(id, content);
  },

  invokeDefaultTypePlugin: async (id, payload) => {
    const { internal_callPluginApi } = get();

    const data = await internal_callPluginApi(id, payload);

    if (!data) return;

    return data;
  },

  invokeMarkdownTypePlugin: async (id, payload) => {
    const { internal_callPluginApi } = get();

    await internal_callPluginApi(id, payload);
  },

  invokeStandaloneTypePlugin: async (id, payload) => {
    const result = await useToolStore.getState().validatePluginSettings(payload.identifier);
    if (!result) return;

    // if the plugin settings is not valid, then set the message with error type
    if (!result.valid) {
      // Get message to extract sessionId/topicId
      const message = dbMessageSelectors.getDbMessageById(id)(get());
      const updateResult = await messageService.updateMessageError(id, {
        body: {
          error: result.errors,
          message: '[plugin] your settings is invalid with plugin manifest setting schema',
        },
        message: t('response.PluginSettingsInvalid', { ns: 'error' }),
        type: PluginErrorType.PluginSettingsInvalid as any,
      });

      if (updateResult?.success && updateResult.messages) {
        get().replaceMessages(updateResult.messages, {
          sessionId: message?.sessionId,
          topicId: message?.topicId,
        });
      }
      return;
    }
  },

  invokeMCPTypePlugin: async (id, payload) => {
    const {
      optimisticUpdateMessageContent,
      internal_togglePluginApiCalling,
      internal_constructToolsCallingContext,
      optimisticUpdatePluginState,
      optimisticUpdateMessagePluginError,
    } = get();
    let data: MCPToolCallResult | undefined;

    // Get message to extract sessionId/topicId
    const message = dbMessageSelectors.getDbMessageById(id)(get());

    try {
      const abortController = internal_togglePluginApiCalling(
        true,
        id,
        n('fetchPlugin/start') as string,
      );

      const context = internal_constructToolsCallingContext(id);
      const result = await mcpService.invokeMcpToolCall(payload, {
        signal: abortController?.signal,
        topicId: context?.topicId,
      });

      if (!!result) data = result;
    } catch (error) {
      console.log(error);
      const err = error as Error;

      // ignore the aborted request error
      if (!err.message.includes('The user aborted a request.')) {
        const result = await messageService.updateMessageError(id, error as any);
        if (result?.success && result.messages) {
          get().replaceMessages(result.messages, {
            sessionId: message?.sessionId,
            topicId: message?.topicId,
          });
        }
      }
    }

    internal_togglePluginApiCalling(false, id, n('fetchPlugin/end') as string);

    // 如果报错则结束了

    if (!data) return;

    const context = { sessionId: message?.sessionId, topicId: message?.topicId };

    await Promise.all([
      optimisticUpdateMessageContent(id, data.content, undefined, context),
      (async () => {
        if (data.success) await optimisticUpdatePluginState(id, data.state, context);
        else await optimisticUpdateMessagePluginError(id, data.error, context);
      })(),
    ]);

    return data.content;
  },

  internal_callPluginApi: async (id, payload) => {
    const { optimisticUpdateMessageContent, internal_togglePluginApiCalling } = get();
    let data: string;

    // Get message to extract sessionId/topicId
    const message = dbMessageSelectors.getDbMessageById(id)(get());

    try {
      const abortController = internal_togglePluginApiCalling(
        true,
        id,
        n('fetchPlugin/start') as string,
      );

      const res = await chatService.runPluginApi(payload, {
        signal: abortController?.signal,
        trace: { observationId: message?.observationId, traceId: message?.traceId },
      });
      data = res.text;

      // save traceId
      if (res.traceId) {
        await messageService.updateMessage(id, { traceId: res.traceId });
      }
    } catch (error) {
      console.log(error);
      const err = error as Error;

      // ignore the aborted request error
      if (!err.message.includes('The user aborted a request.')) {
        const result = await messageService.updateMessageError(id, error as any);
        if (result?.success && result.messages) {
          get().replaceMessages(result.messages, {
            sessionId: message?.sessionId,
            topicId: message?.topicId,
          });
        }
      }

      data = '';
    }

    internal_togglePluginApiCalling(false, id, n('fetchPlugin/end') as string);
    // 如果报错则结束了
    if (!data) return;

    await optimisticUpdateMessageContent(id, data, undefined, {
      sessionId: message?.sessionId,
      topicId: message?.topicId,
    });

    return data;
  },
});
