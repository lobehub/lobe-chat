/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Lobe Group Management Executor
 *
 * Handles all group management tool calls for multi-agent orchestration.
 */
import {
  BroadcastParams,
  CreateAgentParams,
  CreateWorkflowParams,
  DelegateParams,
  ExecuteTaskParams,
  GetAgentInfoParams,
  GroupManagementApiName,
  GroupManagementIdentifier,
  InterruptParams,
  InviteAgentParams,
  RemoveAgentParams,
  SearchAgentParams,
  SpeakParams,
  SummarizeParams,
  VoteParams,
} from '@lobechat/builtin-tool-group-management';
import { formatAgentProfile } from '@lobechat/prompts';

import { agentGroupSelectors, useAgentGroupStore } from '@/store/agentGroup';

import type { BuiltinToolContext, BuiltinToolResult } from '../types';
import { BaseExecutor } from './BaseExecutor';

class GroupManagementExecutor extends BaseExecutor<typeof GroupManagementApiName> {
  readonly identifier = GroupManagementIdentifier;
  protected readonly apiEnum = GroupManagementApiName;

  // ==================== Member Management ====================

  searchAgent = async (
    params: SearchAgentParams,
    _ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    // TODO: Implement agent search logic
    return {
      content: JSON.stringify({
        agents: [],
        message: 'Agent search not yet implemented',
        total: 0,
      }),
      success: true,
    };
  };

  inviteAgent = async (
    params: InviteAgentParams,
    _ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    // TODO: Implement agent invitation logic
    return {
      content: JSON.stringify({
        agentId: params.agentId,
        message: 'Agent invitation not yet implemented',
        success: false,
      }),
      success: true,
    };
  };

  createAgent = async (
    params: CreateAgentParams,
    _ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    console.log(params);
    // TODO: Implement dynamic agent creation
    return {
      content: JSON.stringify({
        message: 'Agent creation not yet implemented',
        success: false,
      }),
      success: true,
    };
  };

  removeAgent = async (
    params: RemoveAgentParams,
    _ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    // TODO: Implement agent removal from group
    return {
      content: JSON.stringify({
        agentId: params.agentId,
        message: 'Agent removal not yet implemented',
        success: false,
      }),
      success: true,
    };
  };

  getAgentInfo = async (
    params: GetAgentInfoParams,
    ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    const { groupId } = ctx;

    if (!groupId) {
      return {
        content: JSON.stringify({ error: 'No group context available', success: false }),
        success: false,
      };
    }

    const agent = agentGroupSelectors.getAgentByIdFromGroup(
      groupId,
      params.agentId,
    )(useAgentGroupStore.getState());

    if (!agent) {
      return { content: `Agent "${params.agentId}" not found in this group`, success: false };
    }

    // Return formatted agent profile for the supervisor
    return { content: formatAgentProfile(agent), state: agent, success: true };
  };

  // ==================== Communication Coordination ====================

  speak = async (params: SpeakParams, ctx: BuiltinToolContext): Promise<BuiltinToolResult> => {
    // Register afterCompletion callback to trigger orchestration after AgentRuntime completes
    // This avoids race conditions with message updates
    if (ctx.groupOrchestration && ctx.agentId && ctx.registerAfterCompletion) {
      ctx.registerAfterCompletion(() =>
        ctx.groupOrchestration!.triggerSpeak({
          agentId: params.agentId,
          instruction: params.instruction,
          supervisorAgentId: ctx.agentId!,
        }),
      );
    }

    // Returns stop: true to indicate the supervisor should stop and let agent respond
    return {
      content: `Triggered agent "${params.agentId}" to respond.`,
      state: {
        agentId: params.agentId,
        instruction: params.instruction,
        type: 'speak',
      },
      stop: true,
      success: true,
    };
  };

  broadcast = async (
    params: BroadcastParams,
    ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    // Register afterCompletion callback to trigger orchestration after AgentRuntime completes
    // This avoids race conditions with message updates
    if (ctx.groupOrchestration && ctx.agentId && ctx.registerAfterCompletion) {
      ctx.registerAfterCompletion(() =>
        ctx.groupOrchestration!.triggerBroadcast({
          agentIds: params.agentIds,
          instruction: params.instruction,
          supervisorAgentId: ctx.agentId!,
          toolMessageId: ctx.messageId, // Pass tool message ID for correct parent-child relationship
        }),
      );
    }

    // Returns stop: true to trigger multiple agents to respond in parallel
    // metadata.agentCouncil marks this tool message for parallel display in conversation-flow
    return {
      content: `Triggered broadcast to agents: ${params.agentIds.join(', ')}.`,
      metadata: { agentCouncil: true },
      state: {
        agentIds: params.agentIds,
        instruction: params.instruction,
        type: 'broadcast',
      },
      stop: true,
      success: true,
    };
  };

  delegate = async (
    params: DelegateParams,
    ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    // Register afterCompletion callback to trigger orchestration after AgentRuntime completes
    // This avoids race conditions with message updates
    if (ctx.groupOrchestration && ctx.agentId && ctx.registerAfterCompletion) {
      ctx.registerAfterCompletion(() =>
        ctx.groupOrchestration!.triggerDelegate({
          agentId: params.agentId,
          reason: params.reason,
          supervisorAgentId: ctx.agentId!,
        }),
      );
    }

    // The supervisor exits and delegated agent takes control
    return {
      content: `Delegated conversation control to agent "${params.agentId}".`,
      state: {
        agentId: params.agentId,
        reason: params.reason,
        type: 'delegate',
      },
      stop: true,
      success: true,
    };
  };

  // ==================== Task Execution ====================

  executeTask = async (
    params: ExecuteTaskParams,
    _ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    // TODO: Implement async task execution
    return {
      content: JSON.stringify({
        agentId: params.agentId,
        message: 'Task execution not yet implemented',
        task: params.task,
      }),
      success: true,
    };
  };

  interrupt = async (
    params: InterruptParams,
    _ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    // TODO: Implement task interruption
    return {
      content: JSON.stringify({
        message: 'Task interruption not yet implemented',
        taskId: params.taskId,
      }),
      success: true,
    };
  };

  // ==================== Context Management ====================

  summarize = async (
    params: SummarizeParams,
    _ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    // TODO: Implement conversation summarization
    return {
      content: JSON.stringify({
        focus: params.focus,
        message: 'Summarization not yet implemented',
        preserveRecent: params.preserveRecent,
      }),
      success: true,
    };
  };

  // ==================== Flow Control ====================

  createWorkflow = async (
    params: CreateWorkflowParams,
    _ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    // TODO: Implement workflow creation
    return {
      content: JSON.stringify({
        message: 'Workflow creation not yet implemented',
        name: params.name,
        steps: params.steps,
      }),
      success: true,
    };
  };

  vote = async (params: VoteParams, _ctx: BuiltinToolContext): Promise<BuiltinToolResult> => {
    // TODO: Implement voting mechanism
    return {
      content: JSON.stringify({
        message: 'Voting not yet implemented',
        options: params.options,
        question: params.question,
      }),
      success: true,
    };
  };
}

// Export the executor instance for registration in index.ts
export const groupManagement = new GroupManagementExecutor();
