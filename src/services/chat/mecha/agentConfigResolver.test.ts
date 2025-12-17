import * as builtinAgents from '@lobechat/builtin-agents';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as agentStore from '@/store/agent';
import * as agentSelectors from '@/store/agent/selectors';

import { resolveAgentConfig } from './agentConfigResolver';

describe('resolveAgentConfig', () => {
  const mockAgentStoreState = { someState: true };
  const mockAgentConfig = {
    model: 'gpt-4',
    plugins: ['plugin-a', 'plugin-b'],
    systemRole: 'You are a helpful assistant',
  };
  const mockChatConfig = {
    enableStreaming: true,
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(agentStore, 'getAgentStoreState').mockReturnValue(mockAgentStoreState as any);
    vi.spyOn(agentSelectors.agentSelectors, 'getAgentConfigById').mockReturnValue(
      () => mockAgentConfig as any,
    );
    vi.spyOn(agentSelectors.chatConfigByIdSelectors, 'getChatConfigById').mockReturnValue(
      () => mockChatConfig as any,
    );
  });

  describe('regular agent (non-builtin)', () => {
    beforeEach(() => {
      // No slug means regular agent
      vi.spyOn(agentSelectors.agentSelectors, 'getAgentSlugById').mockReturnValue(() => undefined);
    });

    it('should return plugins from agent config', () => {
      const result = resolveAgentConfig({ agentId: 'test-agent' });

      expect(result.plugins).toEqual(['plugin-a', 'plugin-b']);
      expect(result.isBuiltinAgent).toBe(false);
    });

    it('should return empty array when agent config has no plugins', () => {
      vi.spyOn(agentSelectors.agentSelectors, 'getAgentConfigById').mockReturnValue(
        () =>
          ({
            ...mockAgentConfig,
            plugins: undefined,
          }) as any,
      );

      const result = resolveAgentConfig({ agentId: 'test-agent' });

      expect(result.plugins).toEqual([]);
      expect(result.isBuiltinAgent).toBe(false);
    });

    it('should return empty array when agent config plugins is null', () => {
      vi.spyOn(agentSelectors.agentSelectors, 'getAgentConfigById').mockReturnValue(
        () =>
          ({
            ...mockAgentConfig,
            plugins: null as any,
          }) as any,
      );

      const result = resolveAgentConfig({ agentId: 'test-agent' });

      expect(result.plugins).toEqual([]);
    });

    it('should return agent config and chat config correctly', () => {
      const result = resolveAgentConfig({ agentId: 'test-agent' });

      expect(result.agentConfig).toEqual(mockAgentConfig);
      expect(result.chatConfig).toEqual(mockChatConfig);
    });

    describe('params adjustment based on chatConfig', () => {
      const mockAgentConfigWithParams = {
        model: 'gpt-4',
        params: {
          max_tokens: 4096,
          reasoning_effort: 'high',
          temperature: 0.7,
        },
        plugins: ['plugin-a'],
        systemRole: 'You are a helpful assistant',
      };

      beforeEach(() => {
        vi.spyOn(agentSelectors.agentSelectors, 'getAgentConfigById').mockReturnValue(
          () => mockAgentConfigWithParams as any,
        );
      });

      it('should include max_tokens when enableMaxTokens is true', () => {
        vi.spyOn(agentSelectors.chatConfigByIdSelectors, 'getChatConfigById').mockReturnValue(
          () =>
            ({
              enableMaxTokens: true,
              enableReasoningEffort: false,
            }) as any,
        );

        const result = resolveAgentConfig({ agentId: 'test-agent' });

        expect(result.agentConfig.params.max_tokens).toBe(4096);
        expect(result.agentConfig.params.reasoning_effort).toBeUndefined();
        expect(result.agentConfig.params.temperature).toBe(0.7);
      });

      it('should set max_tokens to undefined when enableMaxTokens is false', () => {
        vi.spyOn(agentSelectors.chatConfigByIdSelectors, 'getChatConfigById').mockReturnValue(
          () =>
            ({
              enableMaxTokens: false,
              enableReasoningEffort: true,
            }) as any,
        );

        const result = resolveAgentConfig({ agentId: 'test-agent' });

        expect(result.agentConfig.params.max_tokens).toBeUndefined();
        expect(result.agentConfig.params.reasoning_effort).toBe('high');
      });

      it('should include reasoning_effort when enableReasoningEffort is true', () => {
        vi.spyOn(agentSelectors.chatConfigByIdSelectors, 'getChatConfigById').mockReturnValue(
          () =>
            ({
              enableMaxTokens: false,
              enableReasoningEffort: true,
            }) as any,
        );

        const result = resolveAgentConfig({ agentId: 'test-agent' });

        expect(result.agentConfig.params.reasoning_effort).toBe('high');
      });

      it('should set reasoning_effort to undefined when enableReasoningEffort is false', () => {
        vi.spyOn(agentSelectors.chatConfigByIdSelectors, 'getChatConfigById').mockReturnValue(
          () =>
            ({
              enableMaxTokens: true,
              enableReasoningEffort: false,
            }) as any,
        );

        const result = resolveAgentConfig({ agentId: 'test-agent' });

        expect(result.agentConfig.params.reasoning_effort).toBeUndefined();
      });

      it('should handle both params being enabled', () => {
        vi.spyOn(agentSelectors.chatConfigByIdSelectors, 'getChatConfigById').mockReturnValue(
          () =>
            ({
              enableMaxTokens: true,
              enableReasoningEffort: true,
            }) as any,
        );

        const result = resolveAgentConfig({ agentId: 'test-agent' });

        expect(result.agentConfig.params.max_tokens).toBe(4096);
        expect(result.agentConfig.params.reasoning_effort).toBe('high');
      });

      it('should handle both params being disabled', () => {
        vi.spyOn(agentSelectors.chatConfigByIdSelectors, 'getChatConfigById').mockReturnValue(
          () =>
            ({
              enableMaxTokens: false,
              enableReasoningEffort: false,
            }) as any,
        );

        const result = resolveAgentConfig({ agentId: 'test-agent' });

        expect(result.agentConfig.params.max_tokens).toBeUndefined();
        expect(result.agentConfig.params.reasoning_effort).toBeUndefined();
      });

      it('should not mutate original agent config', () => {
        vi.spyOn(agentSelectors.chatConfigByIdSelectors, 'getChatConfigById').mockReturnValue(
          () =>
            ({
              enableMaxTokens: false,
              enableReasoningEffort: false,
            }) as any,
        );

        resolveAgentConfig({ agentId: 'test-agent' });

        // Original should be unchanged
        expect(mockAgentConfigWithParams.params.max_tokens).toBe(4096);
        expect(mockAgentConfigWithParams.params.reasoning_effort).toBe('high');
      });

      it('should skip params adjustment when params is undefined', () => {
        vi.spyOn(agentSelectors.agentSelectors, 'getAgentConfigById').mockReturnValue(
          () =>
            ({
              model: 'gpt-4',
              plugins: ['plugin-a'],
              systemRole: 'You are a helpful assistant',
            }) as any,
        );
        vi.spyOn(agentSelectors.chatConfigByIdSelectors, 'getChatConfigById').mockReturnValue(
          () =>
            ({
              enableMaxTokens: true,
              enableReasoningEffort: true,
            }) as any,
        );

        const result = resolveAgentConfig({ agentId: 'test-agent' });

        expect(result.agentConfig.params).toBeUndefined();
      });
    });
  });

  describe('builtin agent', () => {
    beforeEach(() => {
      // Has slug means builtin agent
      vi.spyOn(agentSelectors.agentSelectors, 'getAgentSlugById').mockReturnValue(
        () => 'agent-builder',
      );
    });

    it('should use runtime plugins when available', () => {
      vi.spyOn(builtinAgents, 'getAgentRuntimeConfig').mockReturnValue({
        plugins: ['runtime-plugin-1', 'runtime-plugin-2'],
        systemRole: 'Runtime system role',
      });

      const result = resolveAgentConfig({ agentId: 'builtin-agent' });

      expect(result.plugins).toEqual(['runtime-plugin-1', 'runtime-plugin-2']);
      expect(result.isBuiltinAgent).toBe(true);
      expect(result.slug).toBe('agent-builder');
    });

    it('should fallback to agent config plugins when runtime plugins is undefined', () => {
      vi.spyOn(builtinAgents, 'getAgentRuntimeConfig').mockReturnValue({
        plugins: undefined,
        systemRole: 'Runtime system role',
      });

      const result = resolveAgentConfig({ agentId: 'builtin-agent' });

      expect(result.plugins).toEqual(['plugin-a', 'plugin-b']);
      expect(result.isBuiltinAgent).toBe(true);
    });

    it('should fallback to agent config plugins when runtime plugins is empty array', () => {
      vi.spyOn(builtinAgents, 'getAgentRuntimeConfig').mockReturnValue({
        plugins: [],
        systemRole: 'Runtime system role',
      });

      const result = resolveAgentConfig({ agentId: 'builtin-agent' });

      expect(result.plugins).toEqual(['plugin-a', 'plugin-b']);
      expect(result.isBuiltinAgent).toBe(true);
    });

    it('should fallback to agent config plugins when runtimeConfig is undefined', () => {
      vi.spyOn(builtinAgents, 'getAgentRuntimeConfig').mockReturnValue(undefined);

      const result = resolveAgentConfig({ agentId: 'builtin-agent' });

      expect(result.plugins).toEqual(['plugin-a', 'plugin-b']);
      expect(result.isBuiltinAgent).toBe(true);
    });

    it('should use runtime systemRole when available', () => {
      vi.spyOn(builtinAgents, 'getAgentRuntimeConfig').mockReturnValue({
        plugins: ['runtime-plugin'],
        systemRole: 'Runtime system role',
      });

      const result = resolveAgentConfig({ agentId: 'builtin-agent' });

      expect(result.agentConfig.systemRole).toBe('Runtime system role');
    });

    it('should fallback to agent config systemRole when runtime systemRole is undefined', () => {
      vi.spyOn(builtinAgents, 'getAgentRuntimeConfig').mockReturnValue({
        plugins: ['runtime-plugin'],
        systemRole: undefined as any,
      });

      const result = resolveAgentConfig({ agentId: 'builtin-agent' });

      expect(result.agentConfig.systemRole).toBe('You are a helpful assistant');
    });

    it('should return empty plugins when both runtime and agent config have no plugins', () => {
      vi.spyOn(agentSelectors.agentSelectors, 'getAgentConfigById').mockReturnValue(
        () =>
          ({
            ...mockAgentConfig,
            plugins: undefined,
          }) as any,
      );
      vi.spyOn(builtinAgents, 'getAgentRuntimeConfig').mockReturnValue({
        plugins: undefined,
        systemRole: 'Runtime system role',
      });

      const result = resolveAgentConfig({ agentId: 'builtin-agent' });

      expect(result.plugins).toEqual([]);
    });

    it('should pass context parameters to getAgentRuntimeConfig', () => {
      const getAgentRuntimeConfigSpy = vi
        .spyOn(builtinAgents, 'getAgentRuntimeConfig')
        .mockReturnValue({
          plugins: ['runtime-plugin'],
          systemRole: 'Runtime system role',
        });

      const targetAgentConfig = { model: 'target-model' };

      resolveAgentConfig({
        agentId: 'builtin-agent',
        documentContent: 'some document content',
        model: 'gpt-4-turbo',
        plugins: ['input-plugin'],
        targetAgentConfig: targetAgentConfig as any,
      });

      expect(getAgentRuntimeConfigSpy).toHaveBeenCalledWith('agent-builder', {
        documentContent: 'some document content',
        model: 'gpt-4-turbo',
        plugins: ['input-plugin'],
        targetAgentConfig,
      });
    });

    it('should merge runtime chatConfig with base chatConfig', () => {
      vi.spyOn(builtinAgents, 'getAgentRuntimeConfig').mockReturnValue({
        chatConfig: {
          enableHistoryCount: false,
          historyCount: 10,
        },
        plugins: ['runtime-plugin'],
        systemRole: 'Runtime system role',
      });

      const result = resolveAgentConfig({ agentId: 'builtin-agent' });

      // Base chatConfig has enableStreaming: true
      // Runtime chatConfig adds enableHistoryCount: false and historyCount: 10
      expect(result.chatConfig).toEqual({
        enableHistoryCount: false,
        enableStreaming: true,
        historyCount: 10,
      });
    });

    it('should override base chatConfig values with runtime chatConfig', () => {
      vi.spyOn(agentSelectors.chatConfigByIdSelectors, 'getChatConfigById').mockReturnValue(
        () =>
          ({
            enableHistoryCount: true,
            enableStreaming: true,
            historyCount: 20,
          }) as any,
      );
      vi.spyOn(builtinAgents, 'getAgentRuntimeConfig').mockReturnValue({
        chatConfig: {
          enableHistoryCount: false,
        },
        plugins: ['runtime-plugin'],
        systemRole: 'Runtime system role',
      });

      const result = resolveAgentConfig({ agentId: 'builtin-agent' });

      expect(result.chatConfig).toEqual({
        enableHistoryCount: false,
        enableStreaming: true,
        historyCount: 20,
      });
    });

    it('should use base chatConfig when runtime chatConfig is undefined', () => {
      vi.spyOn(builtinAgents, 'getAgentRuntimeConfig').mockReturnValue({
        chatConfig: undefined,
        plugins: ['runtime-plugin'],
        systemRole: 'Runtime system role',
      });

      const result = resolveAgentConfig({ agentId: 'builtin-agent' });

      expect(result.chatConfig).toEqual(mockChatConfig);
    });
  });
});
