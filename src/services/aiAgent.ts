import { lambdaClient } from '@/libs/trpc/client';

export interface ExecAgentTaskParams {
  agentId?: string;
  appContext?: {
    groupId?: string | null;
    scope?: string | null;
    sessionId?: string;
    threadId?: string | null;
    topicId?: string | null;
  };
  autoStart?: boolean;
  existingMessageIds?: string[];
  prompt: string;
  slug?: string;
}

export interface ExecGroupSubAgentTaskParams {
  agentId: string;
  groupId: string;
  instruction: string;
  parentMessageId: string;
  timeout?: number;
  topicId: string;
}

export interface GetTaskStatusParams {
  operationId?: string;
  threadId?: string;
}

export interface InterruptTaskParams {
  operationId?: string;
  threadId?: string;
}

class AiAgentService {
  /**
   * Execute a single Agent task
   */
  async execAgentTask(params: ExecAgentTaskParams) {
    return await lambdaClient.aiAgent.execAgent.mutate(params);
  }

  /**
   * Execute a sub-agent task in a group
   */
  async execGroupSubAgentTask(params: ExecGroupSubAgentTaskParams) {
    return await lambdaClient.aiAgent.execGroupSubAgentTask.mutate(params);
  }

  /**
   * Get task status by threadId or operationId
   */
  async getTaskStatus(params: GetTaskStatusParams) {
    return await lambdaClient.aiAgent.getTaskStatus.query(params);
  }

  /**
   * Interrupt a running task
   */
  async interruptTask(params: InterruptTaskParams) {
    return await lambdaClient.aiAgent.interruptTask.mutate(params);
  }
}

export const aiAgentService = new AiAgentService();
