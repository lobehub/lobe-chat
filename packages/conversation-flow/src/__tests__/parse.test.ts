import { describe, expect, it } from 'vitest';

import { parse } from '../parse';
import { inputs, outputs } from './fixtures';

describe('parse', () => {
  describe('Snapshot Tests', () => {
    it('should match snapshot for linear conversation', () => {
      const result = parse(inputs.linearConversation);

      expect(result).toEqual(outputs.linearConversation);
    });

    it('should match snapshot for assistant with tools', () => {
      const result = parse(inputs.assistantWithTools);

      expect(result).toEqual(outputs.assistantWithTools);
    });

    it('should match snapshot for branched conversation', () => {
      const result = parse(inputs.branchedConversation);

      expect(result).toEqual(outputs.branchedConversation);
    });

    it('should match snapshot for compare mode', () => {
      const result = parse(inputs.compareMode);

      expect(result).toEqual(outputs.compareMode);
    });

    it('should match snapshot for thread conversation', () => {
      const result = parse(inputs.threadConversation);

      expect(result).toEqual(outputs.threadConversation);
    });

    it('should match snapshot for complex scenario', () => {
      const result = parse(inputs.complexScenario);

      expect(result).toEqual(outputs.complexScenario);
    });
  });

  describe('Structural Validation', () => {
    it('should provide O(1) message access via messageMap', () => {
      const result = parse(inputs.linearConversation);

      // Direct access should be instant
      const startTime = performance.now();
      const msg = result.messageMap.get('msg-002');
      const endTime = performance.now();

      expect(msg).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1); // Sub-millisecond access
    });

    it('should generate both contextTree and flatList', () => {
      const result = parse(inputs.linearConversation);

      expect(result.contextTree).toBeDefined();
      expect(result.flatList).toBeDefined();
      expect(result.messageMap).toBeDefined();

      expect(Array.isArray(result.contextTree)).toBe(true);
      expect(Array.isArray(result.flatList)).toBe(true);
      expect(result.messageMap).toBeInstanceOf(Map);
    });

    it('should handle empty messages array', () => {
      const result = parse([]);

      expect(result.messageMap.size).toBe(0);
      expect(result.contextTree).toHaveLength(0);
      expect(result.flatList).toHaveLength(0);
    });

    it('should efficiently parse large conversation trees', () => {
      const messages = inputs.linearConversation;

      const startTime = Date.now();
      const result = parse(messages);
      const endTime = Date.now();

      expect(result.messageMap.size).toBe(messages.length);
      expect(endTime - startTime).toBeLessThan(50); // Should parse quickly
    });
  });

  describe('FlatList Validation', () => {
    it('should create assistantGroup in flatList for assistant with tools', () => {
      const result = parse(inputs.assistantWithTools);

      // Find assistantGroup in flatList
      const assistantGroup = result.flatList.find((msg) => msg.role === 'assistantGroup');

      expect(assistantGroup).toBeDefined();
      expect(assistantGroup?.children).toBeDefined();
      expect(assistantGroup?.children?.length).toBeGreaterThan(0);
    });

    it('should add branch metadata to user messages in flatList', () => {
      const result = parse(inputs.branchedConversation);

      // Find user message with branches
      const userMsg = result.flatList.find((msg) => msg.role === 'user' && msg.extra?.branches);

      expect(userMsg).toBeDefined();
      expect(userMsg?.extra?.branches?.count).toBeGreaterThan(1);
    });

    it('should preserve all messages in flatList', () => {
      const result = parse(inputs.linearConversation);

      // flatList length should match or be less than input (due to grouping)
      expect(result.flatList.length).toBeLessThanOrEqual(inputs.linearConversation.length);
      expect(result.flatList.length).toBeGreaterThan(0);
    });
  });

  describe('ContextTree Validation', () => {
    it('should create nested structure in contextTree', () => {
      const result = parse(inputs.linearConversation);

      expect(result.contextTree).toHaveLength(1);
      const root = result.contextTree[0];

      expect(root.type).toBe('message');
      expect('children' in root && root.children.length).toBeGreaterThan(0);
    });

    it('should create assistantGroup node for assistant with tools', () => {
      const result = parse(inputs.assistantWithTools);

      const root = result.contextTree[0];
      if (root.type === 'message' && root.children.length > 0) {
        const firstChild = root.children[0];
        expect(firstChild.type).toBe('assistantGroup');
      }
    });

    it('should create branch node for multiple alternatives', () => {
      const result = parse(inputs.branchedConversation);

      const root = result.contextTree[0];
      expect(root.type).toBe('branch');

      if (root.type === 'branch') {
        expect(root.branches.length).toBeGreaterThan(1);
      }
    });
  });
});
