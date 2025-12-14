/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { ChatToolPayload } from '@lobechat/types';
import { PluginErrorType } from '@lobehub/chat-plugin-sdk';
import debug from 'debug';
import { t } from 'i18next';
import { StateCreator } from 'zustand/vanilla';

import { MCPToolCallResult } from '@/libs/mcp';
import { chatService } from '@/services/chat';
import { mcpService } from '@/services/mcp';
import { messageService } from '@/services/message';
import { ChatStore } from '@/store/chat/store';
import { useToolStore } from '@/store/tool';
import { hasExecutor } from '@/store/tool/slices/builtin/executors';
import { safeParseJSON } from '@/utils/safeParseJSON';

import { dbMessageSelectors } from '../../message/selectors';
import { AI_RUNTIME_OPERATION_TYPES } from '../../operation/types';

const log = debug('lobe-store:plugin-types');

/**
 * Plugin type-specific implementations
 * Each method handles a specific type of plugin invocation
 */
/**
 * Result from invokeBuiltinTool
 */
export interface BuiltinToolInvokeResult {
  content?: string;
  error?: any;
  state?: any;
  stop?: boolean;
  success: boolean;
}

export interface PluginTypesAction {
  /**
   * Invoke builtin tool
   */
  invokeBuiltinTool: (
    id: string,
    payload: ChatToolPayload,
  ) => Promise<BuiltinToolInvokeResult | undefined>;

  /**
   * Invoke default type plugin (returns data)
   */
  invokeDefaultTypePlugin: (id: string, payload: any) => Promise<string | undefined>;

  /**
   * Invoke Klavis type plugin
   */
  invokeKlavisTypePlugin: (id: string, payload: ChatToolPayload) => Promise<string | undefined>;

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
    // Check if this is a Klavis tool by source field
    if (payload.source === 'klavis') {
      return await get().invokeKlavisTypePlugin(id, payload);
    }

    const params = safeParseJSON(payload.arguments);
    if (!params) return { error: 'Invalid arguments', success: false };

    // Check if there's a registered executor in Tool Store (new architecture)
    if (hasExecutor(payload.identifier, payload.apiName)) {
      const { optimisticUpdateToolMessage, registerAfterCompletionCallback } = get();

      // Get operation context
      const operationId = get().messageOperationMap[id];
      const operation = operationId ? get().operations[operationId] : undefined;
      const context = operationId ? { operationId } : undefined;

      // Get agent ID from operation context (the agent currently executing)
      const agentId = operation?.context?.agentId;

      // Get group orchestration callbacks if available (for group management tools)
      const groupOrchestration = get().getGroupOrchestrationCallbacks?.();

      // Find root execAgentRuntime operation for registering afterCompletion callbacks
      // Navigate up the operation tree to find the root runtime operation
      let rootRuntimeOperationId: string | undefined;
      if (operationId) {
        let currentOp = operation;
        while (currentOp) {
          if (AI_RUNTIME_OPERATION_TYPES.includes(currentOp.type)) {
            rootRuntimeOperationId = currentOp.id;
            break;
          }
          // Move up to parent operation
          const parentId = currentOp.parentOperationId;
          currentOp = parentId ? get().operations[parentId] : undefined;
        }
      }

      // Create registerAfterCompletion function that registers callback to root runtime operation
      const registerAfterCompletion = rootRuntimeOperationId
        ? (callback: Parameters<typeof registerAfterCompletionCallback>[1]) => {
            registerAfterCompletionCallback(rootRuntimeOperationId!, callback);
          }
        : undefined;

      log(
        '[invokeBuiltinTool] Using Tool Store executor: %s/%s, messageId=%s, agentId=%s, hasGroupOrchestration=%s, rootRuntimeOp=%s',
        payload.identifier,
        payload.apiName,
        id,
        agentId,
        !!groupOrchestration,
        rootRuntimeOperationId,
      );

      // Call Tool Store's invokeBuiltinTool
      const result = await useToolStore
        .getState()
        .invokeBuiltinTool(payload.identifier, payload.apiName, params, {
          agentId,
          groupOrchestration,
          messageId: id,
          operationId,
          registerAfterCompletion,
          signal: operation?.abortController?.signal,
        });

      // Use optimisticUpdateToolMessage to batch update content, state, error
      await optimisticUpdateToolMessage(
        id,
        {
          content: result.content,
          pluginError: result.error
            ? {
                body: result.error.body,
                message: result.error.message,
                type: result.error.type as any,
              }
            : undefined,
          pluginState: result.state,
        },
        context,
      );

      // If result.stop is true, the tool wants to stop execution flow
      // This is handled by returning from the function (no further processing)
      if (result.stop) {
        log('[invokeBuiltinTool] Executor returned stop=true, stopping execution');
      }

      // Return the result for call_tool executor to use
      return result;
    }

    // Fallback to legacy action-based approach (for backward compatibility)
    // @ts-ignore
    const { [payload.apiName]: action } = get();
    if (!action) {
      console.error(`[invokeBuiltinTool] plugin Action not found: ${payload.apiName}`);
      return { error: `Action not found: ${payload.apiName}`, success: false };
    }

    log('[invokeBuiltinTool] Using legacy action: %s, messageId=%s', payload.apiName, id);

    return (await action(id, params)) as any;
  },

  invokeDefaultTypePlugin: async (id, payload) => {
    const { internal_callPluginApi } = get();

    const data = await internal_callPluginApi(id, payload);

    if (!data) return;

    return data;
  },

  invokeKlavisTypePlugin: async (id, payload) => {
    const {
      optimisticUpdateMessageContent,
      optimisticUpdatePluginState,
      optimisticUpdateMessagePluginError,
    } = get();

    let data: MCPToolCallResult | undefined;

    // Get message to extract agentId/topicId
    const message = dbMessageSelectors.getDbMessageById(id)(get());

    // Get abort controller from operation
    const operationId = get().messageOperationMap[id];
    const operation = operationId ? get().operations[operationId] : undefined;
    const abortController = operation?.abortController;

    log(
      '[invokeKlavisTypePlugin] messageId=%s, tool=%s, operationId=%s, aborted=%s',
      id,
      payload.apiName,
      operationId,
      abortController?.signal.aborted,
    );

    try {
      // payload.identifier 现在是存储用的 identifier（如 'google-calendar'）
      const identifier = payload.identifier;
      const klavisServers = useToolStore.getState().servers || [];
      const server = klavisServers.find((s) => s.identifier === identifier);

      if (!server) {
        throw new Error(`Klavis server not found: ${identifier}`);
      }

      // Parse arguments
      const args = safeParseJSON(payload.arguments) || {};

      // Call Klavis tool via store action
      const result = await useToolStore.getState().callKlavisTool({
        serverUrl: server.serverUrl,
        toolArgs: args,
        toolName: payload.apiName,
      });

      if (!result.success) {
        throw new Error(result.error || 'Klavis tool execution failed');
      }

      // result.data is MCPToolCallProcessedResult from server
      // Convert to MCPToolCallResult format
      const toolResult = result.data;
      if (toolResult) {
        data = {
          content: toolResult.content,
          error: toolResult.state?.isError ? toolResult.state : undefined,
          state: toolResult.state,
          success: toolResult.success,
        };
      }
    } catch (error) {
      console.error('[invokeKlavisTypePlugin] Error:', error);

      // ignore the aborted request error
      const err = error as Error;
      if (err.message.includes('aborted')) {
        log('[invokeKlavisTypePlugin] Request aborted: messageId=%s, tool=%s', id, payload.apiName);
      } else {
        const ctx = {
          agentId: message?.agentId,
          groupId: message?.groupId,
          topicId: message?.topicId,
        };
        const result = await messageService.updateMessageError(id, error as any, ctx);
        if (result?.success && result.messages) {
          get().replaceMessages(result.messages, { context: ctx });
        }
      }
    }

    // 如果报错则结束了
    if (!data) return;

    // operationId already declared above, reuse it
    const context = operationId ? { operationId } : undefined;

    await Promise.all([
      optimisticUpdateMessageContent(id, data.content, undefined, context),
      (async () => {
        if (data.success) await optimisticUpdatePluginState(id, data.state, context);
        else await optimisticUpdateMessagePluginError(id, data.error, context);
      })(),
    ]);

    return data.content;
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
      // Get message to extract agentId/topicId/groupId
      const message = dbMessageSelectors.getDbMessageById(id)(get());
      const ctx = {
        agentId: message?.agentId,
        groupId: message?.groupId,
        topicId: message?.topicId,
      };
      const updateResult = await messageService.updateMessageError(
        id,
        {
          body: {
            error: result.errors,
            message: '[plugin] your settings is invalid with plugin manifest setting schema',
          },
          message: t('response.PluginSettingsInvalid', { ns: 'error' }),
          type: PluginErrorType.PluginSettingsInvalid as any,
        },
        ctx,
      );

      if (updateResult?.success && updateResult.messages) {
        get().replaceMessages(updateResult.messages, { context: ctx });
      }
      return;
    }
  },

  invokeMCPTypePlugin: async (id, payload) => {
    const {
      optimisticUpdateMessageContent,
      internal_constructToolsCallingContext,
      optimisticUpdatePluginState,
      optimisticUpdateMessagePluginError,
    } = get();
    let data: MCPToolCallResult | undefined;

    // Get message to extract agentId/topicId
    const message = dbMessageSelectors.getDbMessageById(id)(get());

    // Get abort controller from operation
    const operationId = get().messageOperationMap[id];
    const operation = operationId ? get().operations[operationId] : undefined;
    const abortController = operation?.abortController;

    log(
      '[invokeMCPTypePlugin] messageId=%s, tool=%s, operationId=%s, aborted=%s',
      id,
      payload.apiName,
      operationId,
      abortController?.signal.aborted,
    );

    try {
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
      if (err.message.includes('The user aborted a request.')) {
        log('[invokeMCPTypePlugin] Request aborted: messageId=%s, tool=%s', id, payload.apiName);
      } else {
        const ctx = {
          agentId: message?.agentId,
          groupId: message?.groupId,
          topicId: message?.topicId,
        };
        const result = await messageService.updateMessageError(id, error as any, ctx);
        if (result?.success && result.messages) {
          get().replaceMessages(result.messages, { context: ctx });
        }
      }
    }

    // 如果报错则结束了

    if (!data) return;

    // operationId already declared above, reuse it
    const context = operationId ? { operationId } : undefined;

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
    const { optimisticUpdateMessageContent } = get();
    let data: string;

    // Get message to extract agentId/topicId
    const message = dbMessageSelectors.getDbMessageById(id)(get());

    // Get abort controller from operation
    const operationId = get().messageOperationMap[id];
    const operation = operationId ? get().operations[operationId] : undefined;
    const abortController = operation?.abortController;

    log(
      '[internal_callPluginApi] messageId=%s, plugin=%s, operationId=%s, aborted=%s',
      id,
      payload.identifier,
      operationId,
      abortController?.signal.aborted,
    );

    try {
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
      if (err.message.includes('The user aborted a request.')) {
        log(
          '[internal_callPluginApi] Request aborted: messageId=%s, plugin=%s',
          id,
          payload.identifier,
        );
      } else {
        const ctx = {
          agentId: message?.agentId,
          groupId: message?.groupId,
          topicId: message?.topicId,
        };
        const result = await messageService.updateMessageError(id, error as any, ctx);
        if (result?.success && result.messages) {
          get().replaceMessages(result.messages, { context: ctx });
        }
      }

      data = '';
    }
    // 如果报错则结束了
    if (!data) return;

    // operationId already declared above, reuse it
    const context = operationId ? { operationId } : undefined;

    await optimisticUpdateMessageContent(id, data, undefined, context);

    return data;
  },
});
