import { AgentRuntimeContext, AgentState } from '@lobechat/agent-runtime';
import { ChatToolPayload } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import { GeneralChatAgent } from '../GeneralChatAgent';

describe('GeneralChatAgent', () => {
  const mockModelRuntimeConfig = {
    model: 'gpt-4o-mini',
    provider: 'openai',
  };

  const createMockState = (overrides?: Partial<AgentState>): AgentState => ({
    sessionId: 'test-session',
    status: 'running',
    messages: [],
    toolManifestMap: {},
    stepCount: 0,
    usage: {
      llm: { apiCalls: 0, processingTimeMs: 0, tokens: { input: 0, output: 0, total: 0 } },
      tools: { totalCalls: 0, totalTimeMs: 0, byTool: [] },
      humanInteraction: {
        approvalRequests: 0,
        promptRequests: 0,
        selectRequests: 0,
        totalWaitingTimeMs: 0,
      },
    },
    cost: {
      calculatedAt: new Date().toISOString(),
      currency: 'USD',
      llm: { byModel: [], currency: 'USD', total: 0 },
      tools: { byTool: [], currency: 'USD', total: 0 },
      total: 0,
    },
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    ...overrides,
  });

  const createMockContext = (
    phase: AgentRuntimeContext['phase'],
    payload?: any,
  ): AgentRuntimeContext => ({
    phase,
    payload,
    session: {
      sessionId: 'test-session',
      messageCount: 0,
      status: 'running',
      stepCount: 0,
    },
  });

  describe('init and user_input phase', () => {
    it('should return call_llm instruction for init phase', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const state = createMockState({
        messages: [{ role: 'user', content: 'Hello' }] as any,
      });
      const context = createMockContext('init', { model: 'gpt-4o-mini', provider: 'openai' });

      const result = await agent.runner(context, state);

      expect(result).toEqual({
        type: 'call_llm',
        payload: {
          messages: state.messages,
          model: 'gpt-4o-mini',
          provider: 'openai',
        },
      });
    });

    it('should return call_llm instruction for user_input phase', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const state = createMockState({
        messages: [{ role: 'user', content: 'What is the weather?' }] as any,
      });
      const context = createMockContext('user_input', {
        message: { role: 'user', content: 'What is the weather?' },
      });

      const result = await agent.runner(context, state);

      expect(result).toEqual({
        type: 'call_llm',
        payload: {
          messages: state.messages,
          message: { role: 'user', content: 'What is the weather?' },
        },
      });
    });
  });

  describe('llm_result phase', () => {
    it('should return finish when no tool calls', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const state = createMockState();
      const context = createMockContext('llm_result', {
        hasToolsCalling: false,
        toolsCalling: [],
        parentMessageId: 'msg-1',
      });

      const result = await agent.runner(context, state);

      expect(result).toEqual({
        type: 'finish',
        reason: 'completed',
        reasonDetail: 'LLM response completed without tool calls',
      });
    });

    it('should return call_tool for single tool that does not need intervention', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const toolCall: ChatToolPayload = {
        id: 'call-1',
        identifier: 'test-plugin',
        apiName: 'test-api',
        arguments: '{}',
        type: 'default',
      };

      const state = createMockState({
        toolManifestMap: {
          'test-plugin': {
            identifier: 'test-plugin',
            // No humanIntervention config = no intervention needed
          },
        },
      });

      const context = createMockContext('llm_result', {
        hasToolsCalling: true,
        toolsCalling: [toolCall],
        parentMessageId: 'msg-1',
      });

      const result = await agent.runner(context, state);

      expect(result).toEqual([
        {
          type: 'call_tool',
          payload: {
            parentMessageId: 'msg-1',
            toolCalling: toolCall,
          },
        },
      ]);
    });

    it('should return call_tools_batch for multiple tools that do not need intervention', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const toolCalls: ChatToolPayload[] = [
        {
          id: 'call-1',
          identifier: 'plugin-1',
          apiName: 'api-1',
          arguments: '{}',
          type: 'default',
        },
        {
          id: 'call-2',
          identifier: 'plugin-2',
          apiName: 'api-2',
          arguments: '{}',
          type: 'default',
        },
      ];

      const state = createMockState({
        toolManifestMap: {
          'plugin-1': { identifier: 'plugin-1' },
          'plugin-2': { identifier: 'plugin-2' },
        },
      });

      const context = createMockContext('llm_result', {
        hasToolsCalling: true,
        toolsCalling: toolCalls,
        parentMessageId: 'msg-1',
      });

      const result = await agent.runner(context, state);

      expect(result).toEqual([
        {
          type: 'call_tools_batch',
          payload: {
            parentMessageId: 'msg-1',
            toolsCalling: toolCalls,
          },
        },
      ]);
    });

    it('should return request_human_approve for tools requiring intervention', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const toolCall: ChatToolPayload = {
        id: 'call-1',
        identifier: 'dangerous-plugin',
        apiName: 'delete-api',
        arguments: '{}',
        type: 'default',
      };

      const state = createMockState({
        toolManifestMap: {
          'dangerous-plugin': {
            identifier: 'dangerous-plugin',
            humanIntervention: 'require', // Always require approval
          },
        },
      });

      const context = createMockContext('llm_result', {
        hasToolsCalling: true,
        toolsCalling: [toolCall],
        parentMessageId: 'msg-1',
      });

      const result = await agent.runner(context, state);

      expect(result).toEqual([
        {
          type: 'request_human_approve',
          pendingToolsCalling: [toolCall],
          reason: 'human_intervention_required',
        },
      ]);
    });

    it('should return both call_tools_batch and request_human_approve for mixed tools', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const safeTool: ChatToolPayload = {
        id: 'call-1',
        identifier: 'safe-plugin',
        apiName: 'read-api',
        arguments: '{}',
        type: 'default',
      };

      const dangerousTool: ChatToolPayload = {
        id: 'call-2',
        identifier: 'dangerous-plugin',
        apiName: 'delete-api',
        arguments: '{}',
        type: 'default',
      };

      const state = createMockState({
        toolManifestMap: {
          'safe-plugin': {
            identifier: 'safe-plugin',
            // No intervention
          },
          'dangerous-plugin': {
            identifier: 'dangerous-plugin',
            humanIntervention: 'require',
          },
        },
      });

      const context = createMockContext('llm_result', {
        hasToolsCalling: true,
        toolsCalling: [safeTool, dangerousTool],
        parentMessageId: 'msg-1',
      });

      const result = await agent.runner(context, state);

      expect(result).toEqual([
        {
          type: 'call_tool',
          payload: {
            parentMessageId: 'msg-1',
            toolCalling: safeTool,
          },
        },
        {
          type: 'request_human_approve',
          pendingToolsCalling: [dangerousTool],
          reason: 'human_intervention_required',
        },
      ]);
    });
  });

  describe('tool_result phase', () => {
    it('should return call_llm when no pending tools', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const state = createMockState({
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: '', tools: [] },
          { role: 'tool', content: 'Result', tool_call_id: 'call-1' },
        ] as any,
      });

      const context = createMockContext('tool_result', {
        parentMessageId: 'tool-msg-1',
        result: { data: 'result' },
      });

      const result = await agent.runner(context, state);

      expect(result).toEqual({
        type: 'call_llm',
        payload: {
          messages: state.messages,
          model: 'gpt-4o-mini',
          parentMessageId: 'tool-msg-1',
          provider: 'openai',
          tools: undefined,
        },
      });
    });

    it('should return request_human_approve when there are pending tools', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const pendingPlugin: ChatToolPayload = {
        id: 'call-2',
        identifier: 'plugin-2',
        apiName: 'api-2',
        arguments: '{}',
        type: 'default',
      };

      const state = createMockState({
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: '', tools: [] },
          { role: 'tool', content: 'Result', tool_call_id: 'call-1' },
          {
            role: 'tool',
            content: '',
            tool_call_id: 'call-2',
            plugin: pendingPlugin,
            pluginIntervention: { status: 'pending' },
          },
        ] as any,
      });

      const context = createMockContext('tool_result', {
        parentMessageId: 'tool-msg-1',
      });

      const result = await agent.runner(context, state);

      expect(result).toEqual({
        type: 'request_human_approve',
        pendingToolsCalling: [pendingPlugin],
        reason: 'Some tools still pending approval',
      });
    });
  });

  describe('tools_batch_result phase', () => {
    it('should return call_llm when no pending tools', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const state = createMockState({
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: '', tools: [] },
          { role: 'tool', content: 'Result 1', tool_call_id: 'call-1' },
          { role: 'tool', content: 'Result 2', tool_call_id: 'call-2' },
        ] as any,
      });

      const context = createMockContext('tools_batch_result', {
        parentMessageId: 'tool-msg-2',
      });

      const result = await agent.runner(context, state);

      expect(result).toEqual({
        type: 'call_llm',
        payload: {
          messages: state.messages,
          model: 'gpt-4o-mini',
          parentMessageId: 'tool-msg-2',
          provider: 'openai',
          tools: undefined,
        },
      });
    });

    it('should return request_human_approve when there are pending tools', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const pendingPlugin: ChatToolPayload = {
        id: 'call-3',
        identifier: 'plugin-3',
        apiName: 'api-3',
        arguments: '{}',
        type: 'default',
      };

      const state = createMockState({
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: '', tools: [] },
          { role: 'tool', content: 'Result 1', tool_call_id: 'call-1' },
          { role: 'tool', content: 'Result 2', tool_call_id: 'call-2' },
          {
            role: 'tool',
            content: '',
            tool_call_id: 'call-3',
            plugin: pendingPlugin,
            pluginIntervention: { status: 'pending' },
          },
        ] as any,
      });

      const context = createMockContext('tools_batch_result', {
        parentMessageId: 'tool-msg-2',
      });

      const result = await agent.runner(context, state);

      expect(result).toEqual({
        type: 'request_human_approve',
        pendingToolsCalling: [pendingPlugin],
        reason: 'Some tools still pending approval',
      });
    });
  });

  describe('error phase', () => {
    it('should return finish instruction with error details', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const state = createMockState();
      const errorMessage = 'Network timeout';
      const context = createMockContext('error', {
        error: new Error(errorMessage),
      });

      const result = await agent.runner(context, state);

      expect(result).toEqual({
        type: 'finish',
        reason: 'error_recovery',
        reasonDetail: errorMessage,
      });
    });

    it('should handle error without message', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const state = createMockState();
      const context = createMockContext('error', { error: {} });

      const result = await agent.runner(context, state);

      expect(result).toEqual({
        type: 'finish',
        reason: 'error_recovery',
        reasonDetail: 'Unknown error occurred',
      });
    });
  });

  describe('unknown phase', () => {
    it('should return finish instruction for unknown phase', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const state = createMockState();
      const context = createMockContext('unknown_phase' as any);

      const result = await agent.runner(context, state);

      expect(result).toEqual({
        type: 'finish',
        reason: 'agent_decision',
        reasonDetail: 'Unknown phase: unknown_phase',
      });
    });
  });

  describe('intervention checking', () => {
    it('should check intervention at API level when configured', async () => {
      const agent = new GeneralChatAgent({
        agentConfig: { maxSteps: 100 },
        sessionId: 'test-session',
        modelRuntimeConfig: mockModelRuntimeConfig,
      });

      const toolCall: ChatToolPayload = {
        id: 'call-1',
        identifier: 'plugin',
        apiName: 'dangerous-api',
        arguments: '{}',
        type: 'default',
      };

      const state = createMockState({
        toolManifestMap: {
          plugin: {
            identifier: 'plugin',
            // Tool-level config
            humanIntervention: 'never',
            api: [
              {
                name: 'safe-api',
                // Safe API
              },
              {
                name: 'dangerous-api',
                // API-level config overrides tool-level
                humanIntervention: 'require',
              },
            ],
          },
        },
      });

      const context = createMockContext('llm_result', {
        hasToolsCalling: true,
        toolsCalling: [toolCall],
        parentMessageId: 'msg-1',
      });

      const result = await agent.runner(context, state);

      // Should require approval because API-level config overrides
      expect(result).toEqual([
        {
          type: 'request_human_approve',
          pendingToolsCalling: [toolCall],
          reason: 'human_intervention_required',
        },
      ]);
    });
  });
});
