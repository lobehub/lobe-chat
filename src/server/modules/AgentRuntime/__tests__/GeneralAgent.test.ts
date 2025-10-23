import type { AgentRuntimeContext, AgentState } from '@lobechat/agent-runtime';
import type { BuiltinToolManifest, HumanInterventionConfig } from '@lobechat/types';
import { beforeEach, describe, expect, it } from 'vitest';

import type { GeneralAgentLLMResultPayload } from '../GeneralAgent';
import { GeneralAgent } from '../GeneralAgent';

describe('GeneralAgent', () => {
  let agent: GeneralAgent;
  let mockState: AgentState;

  beforeEach(() => {
    agent = new GeneralAgent({
      modelRuntimeConfig: {
        model: 'gpt-4',
        provider: 'openai',
      },
      sessionId: 'test-session',
      userId: 'test-user',
    });

    // Base mock state
    mockState = {
      cost: { total: 0 },
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      messages: [
        { content: 'Hello', id: 'msg-1', role: 'user' },
        { content: 'Hi there', id: 'msg-2', role: 'assistant' },
      ],
      sessionId: 'test-session',
      status: 'running',
      stepCount: 0,
      toolManifestMap: {},
      tools: [{ type: 'function', function: { name: 'testTool', parameters: {} } }],
      usage: {
        apiCalls: 0,
        llmUsage: { completionTokens: 0, promptTokens: 0, totalTokens: 0 },
        toolUsage: {},
      },
    } as any;
  });

  describe('user_input phase', () => {
    it('should return call_llm instruction with correct payload', async () => {
      const context: AgentRuntimeContext = {
        phase: 'user_input',
        session: {
          messageCount: 1,
          sessionId: 'test-session',
          status: 'running',
          stepCount: 1,
        },
      };

      const instruction = await agent.runner(context, mockState);

      expect(instruction).toEqual({
        payload: {
          messages: mockState.messages,
          model: 'gpt-4',
          provider: 'openai',
          tools: mockState.tools,
        },
        type: 'call_llm',
      });
    });

    it('should work without modelRuntimeConfig', async () => {
      const agentWithoutConfig = new GeneralAgent({
        sessionId: 'test-session',
      });

      const context: AgentRuntimeContext = {
        phase: 'user_input',
        session: {
          messageCount: 1,
          sessionId: 'test-session',
          status: 'running',
          stepCount: 1,
        },
      };

      const instruction = await agentWithoutConfig.runner(context, mockState);

      expect(instruction).toEqual({
        payload: {
          messages: mockState.messages,
          model: undefined,
          provider: undefined,
          tools: mockState.tools,
        },
        type: 'call_llm',
      });
    });
  });

  describe('llm_result phase', () => {
    describe('without tool calls', () => {
      it('should finish when LLM returns no tools', async () => {
        const context: AgentRuntimeContext = {
          payload: {
            hasToolsCalling: false,
            result: { content: 'Final answer', tool_calls: [] },
            toolsCalling: [],
          } as GeneralAgentLLMResultPayload,
          phase: 'llm_result',
          session: {
            messageCount: 1,
            sessionId: 'test-session',
            status: 'running',
            stepCount: 1,
          },
        };

        const instruction = await agent.runner(context, mockState);

        expect(instruction).toEqual({
          reason: 'completed',
          reasonDetail: 'General agent completed successfully',
          type: 'finish',
        });
      });
    });

    describe('with single tool call', () => {
      it('should return call_tool instruction for single tool', async () => {
        const context: AgentRuntimeContext = {
          payload: {
            hasToolsCalling: true,
            result: { content: '', tool_calls: [] },
            toolsCalling: [
              {
                apiName: 'testOp',
                arguments: '{"param":"value"}',
                id: 'call_1',
                identifier: 'test-tool',
                type: 'default',
              },
            ],
          } as GeneralAgentLLMResultPayload,
          phase: 'llm_result',
          session: {
            messageCount: 1,
            sessionId: 'test-session',
            status: 'running',
            stepCount: 1,
          },
        };

        const instruction = await agent.runner(context, mockState);

        expect(instruction).toEqual({
          payload: {
            apiName: 'testOp',
            arguments: '{"param":"value"}',
            id: 'call_1',
            identifier: 'test-tool',
            type: 'default',
          },
          type: 'call_tool',
        });
      });
    });

    describe('with multiple tool calls', () => {
      it('should return call_tools_batch instruction for multiple tools', async () => {
        const context: AgentRuntimeContext = {
          payload: {
            hasToolsCalling: true,
            result: { content: '', tool_calls: [] },
            toolsCalling: [
              {
                apiName: 'op1',
                arguments: '{}',
                id: 'call_1',
                identifier: 'tool-1',
                type: 'default',
              },
              {
                apiName: 'op2',
                arguments: '{}',
                id: 'call_2',
                identifier: 'tool-2',
                type: 'default',
              },
            ],
          } as GeneralAgentLLMResultPayload,
          phase: 'llm_result',
          session: {
            messageCount: 1,
            sessionId: 'test-session',
            status: 'running',
            stepCount: 1,
          },
        };

        const instruction = await agent.runner(context, mockState);

        expect(instruction).toEqual({
          payload: [
            {
              apiName: 'op1',
              arguments: '{}',
              id: 'call_1',
              identifier: 'tool-1',
              type: 'default',
            },
            {
              apiName: 'op2',
              arguments: '{}',
              id: 'call_2',
              identifier: 'tool-2',
              type: 'default',
            },
          ],
          type: 'call_tools_batch',
        });
      });
    });
  });

  describe('tool_result phase', () => {
    it('should call LLM after tool execution', async () => {
      const context: AgentRuntimeContext = {
        phase: 'tool_result',
        session: {
          messageCount: 2,
          sessionId: 'test-session',
          status: 'running',
          stepCount: 2,
        },
      };

      const instruction = await agent.runner(context, mockState);

      expect(instruction).toEqual({
        payload: {
          messages: mockState.messages,
          model: 'gpt-4',
          provider: 'openai',
          tools: mockState.tools,
        },
        type: 'call_llm',
      });
    });
  });

  describe('tools_batch_result phase', () => {
    it('should call LLM after batch tool execution', async () => {
      const context: AgentRuntimeContext = {
        phase: 'tools_batch_result',
        session: {
          messageCount: 3,
          sessionId: 'test-session',
          status: 'running',
          stepCount: 3,
        },
      };

      const instruction = await agent.runner(context, mockState);

      expect(instruction).toEqual({
        payload: {
          messages: mockState.messages,
          model: 'gpt-4',
          provider: 'openai',
          tools: mockState.tools,
        },
        type: 'call_llm',
      });
    });
  });

  describe('unknown phase', () => {
    it('should finish with error_recovery when phase is unknown', async () => {
      const context: AgentRuntimeContext = {
        phase: 'unknown_phase' as any,
        session: {
          messageCount: 1,
          sessionId: 'test-session',
          status: 'running',
          stepCount: 1,
        },
      };

      const instruction = await agent.runner(context, mockState);

      expect(instruction).toEqual({
        reason: 'error_recovery',
        reasonDetail: 'Unknown phase: unknown_phase',
        type: 'finish',
      });
    });
  });

  describe('Human Intervention', () => {
    describe('checkToolIntervention', () => {
      it('should return never when tool manifest is not found', () => {
        const toolCall = {
          apiName: 'testApi',
          arguments: '{}',
          id: 'call_1',
          identifier: 'unknown-tool',
          type: 'default' as const,
        };

        const policy = agent['checkToolIntervention'](toolCall, undefined);
        expect(policy).toBe('never');
      });

      it('should return never when manifest has no intervention config', () => {
        const toolCall = {
          apiName: 'testApi',
          arguments: '{}',
          id: 'call_1',
          identifier: 'test-tool',
          type: 'default' as const,
        };

        const manifest: BuiltinToolManifest = {
          api: [{ name: 'testApi', description: 'Test API', parameters: {} }],
          identifier: 'test-tool',
          meta: { title: 'Test Tool' },
          systemRole: '',
        };

        const policy = agent['checkToolIntervention'](toolCall, manifest);
        expect(policy).toBe('never');
      });

      it('should return always for tool-level always policy', () => {
        const toolCall = {
          apiName: 'testApi',
          arguments: '{}',
          id: 'call_1',
          identifier: 'test-tool',
          type: 'default' as const,
        };

        const manifest: BuiltinToolManifest = {
          api: [{ name: 'testApi', description: 'Test API', parameters: {} }],
          humanIntervention: 'always',
          identifier: 'test-tool',
          meta: { title: 'Test Tool' },
          systemRole: '',
        };

        const policy = agent['checkToolIntervention'](toolCall, manifest);
        expect(policy).toBe('always');
      });

      it('should return never for tool-level never policy', () => {
        const toolCall = {
          apiName: 'testApi',
          arguments: '{}',
          id: 'call_1',
          identifier: 'test-tool',
          type: 'default' as const,
        };

        const manifest: BuiltinToolManifest = {
          api: [{ name: 'testApi', description: 'Test API', parameters: {} }],
          humanIntervention: 'never',
          identifier: 'test-tool',
          meta: { title: 'Test Tool' },
          systemRole: '',
        };

        const policy = agent['checkToolIntervention'](toolCall, manifest);
        expect(policy).toBe('never');
      });

      it('should check intervention based on tool arguments with API-level rule-based config', () => {
        const toolCall = {
          apiName: 'bash',
          arguments: '{"command":"rm:-rf"}',
          id: 'call_1',
          identifier: 'bash-tool',
          type: 'default' as const,
        };

        const manifest: BuiltinToolManifest = {
          api: [
            {
              description: 'Execute bash command',
              humanIntervention: [
                { match: { command: 'ls:*' }, policy: 'never' },
                { match: { command: 'rm:*' }, policy: 'always' },
                { policy: 'never' },
              ] as HumanInterventionConfig,
              name: 'bash',
              parameters: {},
            },
          ],
          identifier: 'bash-tool',
          meta: { title: 'Bash Tool' },
          systemRole: '',
        };

        const policy = agent['checkToolIntervention'](toolCall, manifest);
        expect(policy).toBe('always');
      });

      it('should handle invalid JSON in tool arguments gracefully', () => {
        const toolCall = {
          apiName: 'testApi',
          arguments: 'invalid-json',
          id: 'call_1',
          identifier: 'test-tool',
          type: 'default' as const,
        };

        const manifest: BuiltinToolManifest = {
          api: [
            {
              description: 'Test API',
              humanIntervention: 'always' as HumanInterventionConfig,
              name: 'testApi',
              parameters: {},
            },
          ],
          identifier: 'test-tool',
          meta: { title: 'Test Tool' },
          systemRole: '',
        };

        const policy = agent['checkToolIntervention'](toolCall, manifest);
        expect(policy).toBe('always');
      });

      it('should match wildcard patterns in arguments', () => {
        const toolCall = {
          apiName: 'fileOperation',
          arguments: '{"path":"/Users/project/file.ts"}',
          id: 'call_1',
          identifier: 'file-tool',
          type: 'default' as const,
        };

        const manifest: BuiltinToolManifest = {
          api: [
            {
              description: 'File operation',
              humanIntervention: [
                { match: { path: '/Users/project/*' }, policy: 'never' },
                { policy: 'always' },
              ] as HumanInterventionConfig,
              name: 'fileOperation',
              parameters: {},
            },
          ],
          identifier: 'file-tool',
          meta: { title: 'File Tool' },
          systemRole: '',
        };

        const policy = agent['checkToolIntervention'](toolCall, manifest);
        expect(policy).toBe('never');
      });

      it('should prioritize API-level config over tool-level config', () => {
        const toolCall = {
          apiName: 'dangerousApi',
          arguments: '{}',
          id: 'call_1',
          identifier: 'mixed-tool',
          type: 'default' as const,
        };

        const manifest: BuiltinToolManifest = {
          api: [
            {
              description: 'Dangerous API',
              humanIntervention: 'always',
              name: 'dangerousApi',
              parameters: {},
            },
            {
              description: 'Safe API',
              name: 'safeApi',
              parameters: {},
            },
          ],
          humanIntervention: 'never', // Tool-level default
          identifier: 'mixed-tool',
          meta: { title: 'Mixed Tool' },
          systemRole: '',
        };

        const policy = agent['checkToolIntervention'](toolCall, manifest);
        expect(policy).toBe('always'); // API-level should override tool-level
      });

      it('should fall back to tool-level policy when API has no config', () => {
        const toolCall = {
          apiName: 'safeApi',
          arguments: '{}',
          id: 'call_1',
          identifier: 'mixed-tool',
          type: 'default' as const,
        };

        const manifest: BuiltinToolManifest = {
          api: [
            {
              description: 'Dangerous API',
              humanIntervention: 'always',
              name: 'dangerousApi',
              parameters: {},
            },
            {
              description: 'Safe API',
              name: 'safeApi',
              parameters: {},
            },
          ],
          humanIntervention: 'first', // Tool-level default
          identifier: 'mixed-tool',
          meta: { title: 'Mixed Tool' },
          systemRole: '',
        };

        const policy = agent['checkToolIntervention'](toolCall, manifest);
        expect(policy).toBe('first'); // Should use tool-level default
      });

      it('should support complex API-level rules while tool has simple policy', () => {
        const toolCall = {
          apiName: 'bash',
          arguments: '{"command":"ls:"}',
          id: 'call_1',
          identifier: 'bash-tool',
          type: 'default' as const,
        };

        const manifest: BuiltinToolManifest = {
          api: [
            {
              description: 'Execute bash command',
              humanIntervention: [
                { match: { command: 'ls:*' }, policy: 'never' },
                { match: { command: 'rm:*' }, policy: 'always' },
                { policy: 'first' },
              ] as HumanInterventionConfig,
              name: 'bash',
              parameters: {},
            },
          ],
          humanIntervention: 'always', // Tool-level would require always
          identifier: 'bash-tool',
          meta: { title: 'Bash Tool' },
          systemRole: '',
        };

        const policy = agent['checkToolIntervention'](toolCall, manifest);
        expect(policy).toBe('never'); // API-level rule should match and return never
      });
    });

    describe('llm_result phase with intervention', () => {
      it('should request approval when tool requires always intervention', async () => {
        const context: AgentRuntimeContext = {
          payload: {
            hasToolsCalling: true,
            result: { content: '', tool_calls: [] },
            toolsCalling: [
              {
                apiName: 'dangerousOp',
                arguments: '{}',
                id: 'call_1',
                identifier: 'danger-tool',
                type: 'default',
              },
            ],
          } as GeneralAgentLLMResultPayload,
          phase: 'llm_result',
          session: {
            messageCount: 1,
            sessionId: 'test-session',
            status: 'running',
            stepCount: 1,
          },
        };

        mockState.toolManifestMap = {
          'danger-tool': {
            api: [
              {
                description: 'Dangerous operation',
                humanIntervention: 'always',
                name: 'dangerousOp',
                parameters: {},
              },
            ],
            identifier: 'danger-tool',
            meta: { title: 'Danger Tool' },
            systemRole: '',
          },
        };

        const instruction = await agent.runner(context, mockState);
        expect(instruction).toEqual({
          pendingToolsCalling: [
            {
              apiName: 'dangerousOp',
              arguments: '{}',
              id: 'call_1',
              identifier: 'danger-tool',
              type: 'default',
            },
          ],
          reason: 'Tools require human approval',
          type: 'request_human_approve',
        });
      });

      it('should execute tool directly when intervention is never', async () => {
        const context: AgentRuntimeContext = {
          payload: {
            hasToolsCalling: true,
            result: { content: '', tool_calls: [] },
            toolsCalling: [
              {
                apiName: 'safeOp',
                arguments: '{}',
                id: 'call_1',
                identifier: 'safe-tool',
                type: 'default',
              },
            ],
          } as GeneralAgentLLMResultPayload,
          phase: 'llm_result',
          session: {
            messageCount: 1,
            sessionId: 'test-session',
            status: 'running',
            stepCount: 1,
          },
        };

        mockState.toolManifestMap = {
          'safe-tool': {
            api: [
              {
                description: 'Safe operation',
                name: 'safeOp',
                parameters: {},
              },
            ],
            humanIntervention: 'never',
            identifier: 'safe-tool',
            meta: { title: 'Safe Tool' },
            systemRole: '',
          },
        };

        const instruction = await agent.runner(context, mockState);
        expect(instruction).toEqual({
          payload: {
            apiName: 'safeOp',
            arguments: '{}',
            id: 'call_1',
            identifier: 'safe-tool',
            type: 'default',
          },
          type: 'call_tool',
        });
      });

      it('should handle mixed intervention policies in batch tool calls', async () => {
        const context: AgentRuntimeContext = {
          payload: {
            hasToolsCalling: true,
            result: { content: '', tool_calls: [] },
            toolsCalling: [
              {
                apiName: 'safeOp',
                arguments: '{}',
                id: 'call_1',
                identifier: 'safe-tool',
                type: 'default',
              },
              {
                apiName: 'dangerousOp',
                arguments: '{}',
                id: 'call_2',
                identifier: 'danger-tool',
                type: 'default',
              },
            ],
          } as GeneralAgentLLMResultPayload,
          phase: 'llm_result',
          session: {
            messageCount: 1,
            sessionId: 'test-session',
            status: 'running',
            stepCount: 1,
          },
        };

        mockState.toolManifestMap = {
          'danger-tool': {
            api: [
              {
                description: 'Dangerous operation',
                humanIntervention: 'always',
                name: 'dangerousOp',
                parameters: {},
              },
            ],
            identifier: 'danger-tool',
            meta: { title: 'Danger Tool' },
            systemRole: '',
          },
          'safe-tool': {
            api: [
              {
                description: 'Safe operation',
                name: 'safeOp',
                parameters: {},
              },
            ],
            humanIntervention: 'never',
            identifier: 'safe-tool',
            meta: { title: 'Safe Tool' },
            systemRole: '',
          },
        };

        const instruction = await agent.runner(context, mockState);
        expect(instruction).toEqual({
          pendingToolsCalling: [
            {
              apiName: 'dangerousOp',
              arguments: '{}',
              id: 'call_2',
              identifier: 'danger-tool',
              type: 'default',
            },
          ],
          reason: 'Tools require human approval',
          type: 'request_human_approve',
        });
      });

      it('should use batch execution when all tools need no intervention', async () => {
        const context: AgentRuntimeContext = {
          payload: {
            hasToolsCalling: true,
            result: { content: '', tool_calls: [] },
            toolsCalling: [
              {
                apiName: 'safeOp1',
                arguments: '{}',
                id: 'call_1',
                identifier: 'safe-tool-1',
                type: 'default',
              },
              {
                apiName: 'safeOp2',
                arguments: '{}',
                id: 'call_2',
                identifier: 'safe-tool-2',
                type: 'default',
              },
            ],
          } as GeneralAgentLLMResultPayload,
          phase: 'llm_result',
          session: {
            messageCount: 1,
            sessionId: 'test-session',
            status: 'running',
            stepCount: 1,
          },
        };

        mockState.toolManifestMap = {
          'safe-tool-1': {
            api: [
              {
                description: 'Safe operation 1',
                name: 'safeOp1',
                parameters: {},
              },
            ],
            humanIntervention: 'never',
            identifier: 'safe-tool-1',
            meta: { title: 'Safe Tool 1' },
            systemRole: '',
          },
          'safe-tool-2': {
            api: [
              {
                description: 'Safe operation 2',
                name: 'safeOp2',
                parameters: {},
              },
            ],
            humanIntervention: 'never',
            identifier: 'safe-tool-2',
            meta: { title: 'Safe Tool 2' },
            systemRole: '',
          },
        };

        const instruction = await agent.runner(context, mockState);
        expect(instruction).toEqual({
          payload: [
            {
              apiName: 'safeOp1',
              arguments: '{}',
              id: 'call_1',
              identifier: 'safe-tool-1',
              type: 'default',
            },
            {
              apiName: 'safeOp2',
              arguments: '{}',
              id: 'call_2',
              identifier: 'safe-tool-2',
              type: 'default',
            },
          ],
          type: 'call_tools_batch',
        });
      });

      it('should handle tools without manifest gracefully in batch', async () => {
        const context: AgentRuntimeContext = {
          payload: {
            hasToolsCalling: true,
            result: { content: '', tool_calls: [] },
            toolsCalling: [
              {
                apiName: 'unknownOp',
                arguments: '{}',
                id: 'call_1',
                identifier: 'unknown-tool',
                type: 'default',
              },
              {
                apiName: 'safeOp',
                arguments: '{}',
                id: 'call_2',
                identifier: 'safe-tool',
                type: 'default',
              },
            ],
          } as GeneralAgentLLMResultPayload,
          phase: 'llm_result',
          session: {
            messageCount: 1,
            sessionId: 'test-session',
            status: 'running',
            stepCount: 1,
          },
        };

        mockState.toolManifestMap = {
          'safe-tool': {
            api: [
              {
                description: 'Safe operation',
                name: 'safeOp',
                parameters: {},
              },
            ],
            humanIntervention: 'never',
            identifier: 'safe-tool',
            meta: { title: 'Safe Tool' },
            systemRole: '',
          },
        };

        const instruction = await agent.runner(context, mockState);
        expect(instruction).toEqual({
          payload: [
            {
              apiName: 'unknownOp',
              arguments: '{}',
              id: 'call_1',
              identifier: 'unknown-tool',
              type: 'default',
            },
            {
              apiName: 'safeOp',
              arguments: '{}',
              id: 'call_2',
              identifier: 'safe-tool',
              type: 'default',
            },
          ],
          type: 'call_tools_batch',
        });
      });
    });

    describe('parameter-based intervention rules', () => {
      it('should allow safe commands but block dangerous ones', async () => {
        const safeContext: AgentRuntimeContext = {
          payload: {
            hasToolsCalling: true,
            result: { content: '', tool_calls: [] },
            toolsCalling: [
              {
                apiName: 'bash',
                arguments: '{"command":"ls:"}',
                id: 'call_1',
                identifier: 'bash-tool',
                type: 'default',
              },
            ],
          } as GeneralAgentLLMResultPayload,
          phase: 'llm_result',
          session: {
            messageCount: 1,
            sessionId: 'test-session',
            status: 'running',
            stepCount: 1,
          },
        };

        mockState.toolManifestMap = {
          'bash-tool': {
            api: [
              {
                description: 'Execute bash command',
                humanIntervention: [
                  { match: { command: 'ls:*' }, policy: 'never' },
                  { match: { command: 'rm:*' }, policy: 'always' },
                  { policy: 'always' },
                ] as HumanInterventionConfig,
                name: 'bash',
                parameters: {},
              },
            ],
            identifier: 'bash-tool',
            meta: { title: 'Bash Tool' },
            systemRole: '',
          },
        };

        const safeInstruction = await agent.runner(safeContext, mockState);
        expect(Array.isArray(safeInstruction)).toBe(false);
        expect((safeInstruction as any).type).toBe('call_tool');

        const dangerContext: AgentRuntimeContext = {
          payload: {
            hasToolsCalling: true,
            result: { content: '', tool_calls: [] },
            toolsCalling: [
              {
                apiName: 'bash',
                arguments: '{"command":"rm:-rf"}',
                id: 'call_2',
                identifier: 'bash-tool',
                type: 'default',
              },
            ],
          } as GeneralAgentLLMResultPayload,
          phase: 'llm_result',
          session: {
            messageCount: 1,
            sessionId: 'test-session',
            status: 'running',
            stepCount: 1,
          },
        };

        const dangerInstruction = await agent.runner(dangerContext, mockState);
        expect(Array.isArray(dangerInstruction)).toBe(false);
        expect((dangerInstruction as any).type).toBe('request_human_approve');
      });

      it('should apply default rule when no match is found', async () => {
        const context: AgentRuntimeContext = {
          payload: {
            hasToolsCalling: true,
            result: { content: '', tool_calls: [] },
            toolsCalling: [
              {
                apiName: 'bash',
                arguments: '{"command":"npm install"}',
                id: 'call_1',
                identifier: 'bash-tool',
                type: 'default',
              },
            ],
          } as GeneralAgentLLMResultPayload,
          phase: 'llm_result',
          session: {
            messageCount: 1,
            sessionId: 'test-session',
            status: 'running',
            stepCount: 1,
          },
        };

        mockState.toolManifestMap = {
          'bash-tool': {
            api: [
              {
                description: 'Execute bash command',
                humanIntervention: [
                  { match: { command: 'ls:*' }, policy: 'never' },
                  { policy: 'first' },
                ] as HumanInterventionConfig,
                name: 'bash',
                parameters: {},
              },
            ],
            identifier: 'bash-tool',
            meta: { title: 'Bash Tool' },
            systemRole: '',
          },
        };

        const instruction = await agent.runner(context, mockState);
        expect(Array.isArray(instruction)).toBe(false);
        expect((instruction as any).type).toBe('call_tool');
      });
    });
  });

  describe('getConfig', () => {
    it('should return the agent config', () => {
      const config = agent.getConfig();
      expect(config).toEqual({
        modelRuntimeConfig: {
          model: 'gpt-4',
          provider: 'openai',
        },
        sessionId: 'test-session',
        userId: 'test-user',
      });
    });
  });
});
