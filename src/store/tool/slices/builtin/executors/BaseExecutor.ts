/**
 * Base Executor Class
 *
 * Provides automatic invoke/hasApi/getApiNames implementation.
 * Subclasses only need to define business methods.
 *
 * Usage:
 * ```typescript
 * class MyExecutor extends BaseExecutor<typeof MyApiName> {
 *   readonly identifier = 'my-tool';
 *   protected readonly apiEnum = MyApiName;
 *
 *   myMethod = async (params: MyParams, ctx: BuiltinToolContext) => {
 *     // business logic
 *     return { success: true, content: 'result' };
 *   };
 * }
 * ```
 */
import type { BuiltinToolContext, BuiltinToolResult, IBuiltinToolExecutor } from '../types';

/**
 * Base class for builtin tool executors
 * Automatically implements invoke/hasApi/getApiNames based on the apiEnum
 */
export abstract class BaseExecutor<
  TApiEnum extends Record<string, string>,
> implements IBuiltinToolExecutor {
  /**
   * The tool identifier (e.g., 'lobe-group-management')
   */
  abstract readonly identifier: string;

  /**
   * The API name enum for this executor
   * Used to validate API names and auto-discover methods
   */
  protected abstract readonly apiEnum: TApiEnum;

  /**
   * Invoke a specific API of this tool
   * Automatically routes to the corresponding method
   */
  invoke = async (
    apiName: string,
    params: any,
    ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    // Validate API name
    if (!this.hasApi(apiName)) {
      return {
        error: {
          message: `Unknown API: ${apiName}`,
          type: 'ApiNotFound',
        },
        success: false,
      };
    }

    // Get the method from this instance
    const method = (this as any)[apiName];

    if (typeof method !== 'function') {
      return {
        error: {
          message: `Method not implemented: ${apiName}`,
          type: 'MethodNotImplemented',
        },
        success: false,
      };
    }

    // Invoke the method
    return method(params, ctx);
  };

  /**
   * Check if this executor supports the given API
   */
  hasApi(apiName: string): boolean {
    return Object.values(this.apiEnum).includes(apiName);
  }

  /**
   * Get all supported API names
   */
  getApiNames(): string[] {
    return Object.values(this.apiEnum);
  }
}
