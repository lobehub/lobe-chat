import { ClaudeCodeServiceImpl } from './impl';
import { ClaudeCodeImpl, ClaudeCodeRuntimeConfig } from './type';

/**
 * Create Claude Code module instance
 */
export const createClaudeCodeModule = (config?: ClaudeCodeRuntimeConfig): ClaudeCodeImpl => {
  return new ClaudeCodeServiceImpl(config);
};

// Export types and implementation
export type {
  ClaudeCodeProcessOptions,
  ClaudeCodeProcessResult,
  ClaudeCodeQueryParams,
  ClaudeCodeRuntimeConfig,
  ClaudeCodeStreamingParams,
} from './type';
