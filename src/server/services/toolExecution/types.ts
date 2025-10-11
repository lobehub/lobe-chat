import { ChatToolPayload, ClientSecretPayload } from '@lobechat/types';

export interface ToolExecutionContext {
  userId?: string;
  userPayload?: ClientSecretPayload;
}

export interface ToolExecutionResult {
  content: string;
  error?: any;
  state?: Record<string, any>;
  success: boolean;
}

export interface ToolExecutionResultResponse extends ToolExecutionResult {
  executionTime: number;
}

export interface IToolExecutor {
  execute(payload: ChatToolPayload, context: ToolExecutionContext): Promise<ToolExecutionResult>;
}
