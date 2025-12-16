/**
 * Builtin Tool Executor Registry
 *
 * Central registry for all builtin tool executors.
 * Executors are registered as class instances by identifier.
 */
import { groupManagementExecutor } from '@lobechat/builtin-tool-group-management/executor';
import { gtdExecutor } from '@lobechat/builtin-tool-gtd';

import type { IBuiltinToolExecutor } from '../types';
// ==================== Import and register all executors ====================

import { webBrowsing } from './lobe-web-browsing';

/**
 * Registry structure: Map<identifier, executor instance>
 */
const executorRegistry = new Map<string, IBuiltinToolExecutor>();

/**
 * Register a builtin tool executor class instance
 *
 * @param executor - The executor instance to register
 */
export const registerExecutor = (executor: IBuiltinToolExecutor): void => {
  executorRegistry.set(executor.identifier, executor);
};

/**
 * Get a builtin tool executor by identifier
 *
 * @param identifier - The tool identifier
 * @returns The executor instance or undefined if not found
 */
export const getExecutor = (identifier: string): IBuiltinToolExecutor | undefined => {
  return executorRegistry.get(identifier);
};

/**
 * Check if an executor exists for the given identifier and apiName
 *
 * @param identifier - The tool identifier
 * @param apiName - The API name
 * @returns Whether the executor exists and supports the API
 */
export const hasExecutor = (identifier: string, apiName: string): boolean => {
  const executor = executorRegistry.get(identifier);
  return executor?.hasApi(apiName) ?? false;
};

/**
 * Get all registered identifiers
 *
 * @returns Array of registered identifiers
 */
export const getRegisteredIdentifiers = (): string[] => {
  return Array.from(executorRegistry.keys());
};

/**
 * Get all API names for a given identifier
 *
 * @param identifier - The tool identifier
 * @returns Array of API names or empty array if identifier not found
 */
export const getApiNamesForIdentifier = (identifier: string): string[] => {
  const executor = executorRegistry.get(identifier);
  return executor?.getApiNames() ?? [];
};

/**
 * Invoke a builtin tool executor
 *
 * @param identifier - The tool identifier
 * @param apiName - The API name
 * @param params - The parameters
 * @param ctx - The execution context
 * @returns The execution result
 */
export const invokeExecutor = async (
  identifier: string,
  apiName: string,
  params: any,
  ctx: import('../types').BuiltinToolContext,
): Promise<import('../types').BuiltinToolResult> => {
  const executor = executorRegistry.get(identifier);

  if (!executor) {
    return {
      error: {
        message: `Executor not found: ${identifier}`,
        type: 'ExecutorNotFound',
      },
      success: false,
    };
  }

  if (!executor.hasApi(apiName)) {
    return {
      error: {
        message: `API not found: ${identifier}/${apiName}`,
        type: 'ApiNotFound',
      },
      success: false,
    };
  }

  return executor.invoke(apiName, params, ctx);
};

// Register all executor instances
registerExecutor(groupManagementExecutor);
registerExecutor(gtdExecutor);
registerExecutor(webBrowsing);
