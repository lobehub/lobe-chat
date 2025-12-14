import { describe, expect, it } from 'vitest';

import type { PipelineContext } from '../../types';
import { GroupContextInjector } from '../GroupContextInjector';

describe('GroupContextInjector', () => {
  const createContext = (messages: any[]): PipelineContext => ({
    initialState: { messages: [] },
    isAborted: false,
    messages,
    metadata: {},
  });

  describe('Basic Scenarios', () => {
    it('should inject group context into system message', async () => {
      const injector = new GroupContextInjector({
        currentAgentId: 'agt_editor',
        currentAgentName: 'Editor',
        currentAgentRole: 'participant',
        enabled: true,
        groupName: 'Writing Team',
        members: [
          { id: 'agt_supervisor', name: 'Supervisor', role: 'supervisor' },
          { id: 'agt_writer', name: 'Writer', role: 'participant' },
          { id: 'agt_editor', name: 'Editor', role: 'participant' },
        ],
      });

      const input: any[] = [
        { role: 'system', content: 'You are a helpful editor.' },
        { role: 'user', content: 'Please review this.' },
      ];

      const context = createContext(input);
      const result = await injector.process(context);

      const systemContent = result.messages[0].content;

      // Original content should be preserved
      expect(systemContent).toContain('You are a helpful editor.');

      // Group context markers should be present
      expect(systemContent).toContain('<!-- GROUP CONTEXT -->');
      expect(systemContent).toContain('<!-- END GROUP CONTEXT -->');

      // Identity section
      expect(systemContent).toContain('[Your Identity]');
      expect(systemContent).toContain('Name: Editor');
      expect(systemContent).toContain('Role: participant');
      expect(systemContent).toContain('Agent ID: agt_editor (internal use only, never expose)');

      // Group info section
      expect(systemContent).toContain('[Group Info]');
      expect(systemContent).toContain('Group: Writing Team');
      expect(systemContent).toContain('Members:');
      expect(systemContent).toContain('- Supervisor (supervisor)');
      expect(systemContent).toContain('- Writer (participant)');
      expect(systemContent).toContain('- Editor (participant) <- You');

      // Rules section (important for LOBE-1866)
      expect(systemContent).toContain('[Important Rules]');
      expect(systemContent).toContain('<!-- SYSTEM CONTEXT -->');
      expect(systemContent).toContain('MUST NEVER appear in your responses');

      // Metadata should be updated
      expect(result.metadata.groupContextInjected).toBe(true);
    });

    it('should skip injection when disabled', async () => {
      const injector = new GroupContextInjector({
        currentAgentId: 'agt_editor',
        currentAgentName: 'Editor',
        enabled: false, // Disabled
      });

      const input: any[] = [{ role: 'system', content: 'You are a helpful editor.' }];

      const context = createContext(input);
      const result = await injector.process(context);

      // Should be unchanged
      expect(result.messages[0].content).toBe('You are a helpful editor.');
      expect(result.metadata.groupContextInjected).toBeUndefined();
    });

    it('should skip injection when no system message exists', async () => {
      const injector = new GroupContextInjector({
        currentAgentId: 'agt_editor',
        currentAgentName: 'Editor',
        enabled: true,
      });

      const input: any[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];

      const context = createContext(input);
      const result = await injector.process(context);

      // Messages should be unchanged
      expect(result.messages[0].content).toBe('Hello');
      expect(result.messages[1].content).toBe('Hi there!');
      expect(result.metadata.groupContextInjected).toBeUndefined();
    });
  });

  describe('Variable Replacement', () => {
    it('should handle config with only identity info', async () => {
      const injector = new GroupContextInjector({
        currentAgentId: 'agt_editor',
        currentAgentName: 'Editor',
        currentAgentRole: 'participant',
        enabled: true,
      });

      const input: any[] = [{ content: 'You are an editor.', role: 'system' }];

      const context = createContext(input);
      const result = await injector.process(context);

      expect(result.messages[0].content).toMatchSnapshot();
    });

    it('should handle config with only group info', async () => {
      const injector = new GroupContextInjector({
        enabled: true,
        groupName: 'Test Group',
        members: [{ id: 'agt_1', name: 'Agent 1', role: 'participant' }],
      });

      const input: any[] = [{ content: 'System prompt.', role: 'system' }];

      const context = createContext(input);
      const result = await injector.process(context);

      expect(result.messages[0].content).toMatchSnapshot();
    });

    it('should handle empty config', async () => {
      const injector = new GroupContextInjector({
        enabled: true,
      });

      const input: any[] = [{ content: 'Base prompt.', role: 'system' }];

      const context = createContext(input);
      const result = await injector.process(context);

      expect(result.messages[0].content).toMatchSnapshot();
    });
  });

  describe('Rules Section (LOBE-1866)', () => {
    it('should always include rules about SYSTEM CONTEXT blocks', async () => {
      const injector = new GroupContextInjector({
        enabled: true,
        // Minimal config
      });

      const input: any[] = [{ role: 'system', content: 'Base prompt.' }];

      const context = createContext(input);
      const result = await injector.process(context);

      const systemContent = result.messages[0].content;

      // Even with minimal config, rules section should be present
      expect(systemContent).toContain('[Important Rules]');
      expect(systemContent).toContain(
        'Messages in the conversation may contain "<!-- SYSTEM CONTEXT -->" blocks.',
      );
      expect(systemContent).toContain(
        'These are application-level metadata and MUST NEVER appear in your responses.',
      );
      expect(systemContent).toContain(
        'Never reproduce, reference, or include any XML-like tags or comment markers from the conversation.',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty members array', async () => {
      const injector = new GroupContextInjector({
        enabled: true,
        groupName: 'Empty Group',
        members: [],
      });

      const input: any[] = [{ content: 'Prompt.', role: 'system' }];

      const context = createContext(input);
      const result = await injector.process(context);

      expect(result.messages[0].content).toMatchSnapshot();
    });

    it('should preserve other messages unchanged', async () => {
      const injector = new GroupContextInjector({
        currentAgentId: 'agt_1',
        currentAgentName: 'Agent 1',
        enabled: true,
      });

      const input: any[] = [
        { role: 'system', content: 'System prompt.' },
        { role: 'user', content: 'User message.' },
        { role: 'assistant', content: 'Assistant response.' },
      ];

      const context = createContext(input);
      const result = await injector.process(context);

      // Only system message should be modified
      expect(result.messages[0].content).toContain('<!-- GROUP CONTEXT -->');
      expect(result.messages[1].content).toBe('User message.');
      expect(result.messages[2].content).toBe('Assistant response.');
    });
  });
});
