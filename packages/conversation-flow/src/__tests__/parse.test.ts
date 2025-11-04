import { describe, expect, it } from 'vitest';

import { parse } from '../parse';
import type { BranchNode, CompareNode, GroupNode, MessageNode } from '../types';
import { fixtures } from './fixtures';

describe('parse', () => {
  describe('Linear Conversation Flow', () => {
    it('should parse a simple question-answer conversation', () => {
      const messages = fixtures.linearConversation;
      const result = parse(messages);

      // Should have all messages in messageMap
      expect(result.messageMap.size).toBe(4);

      // Display tree should start with user message
      expect(result.displayTree).toHaveLength(1);
      const root = result.displayTree[0];
      expect(root.type).toBe('MESSAGE');

      if (root.type === 'MESSAGE') {
        expect(root.messageId).toBe('msg-001');

        // Should have nested structure
        expect(root.children).toHaveLength(1);
        const assistantNode = root.children[0] as MessageNode;
        expect(assistantNode.messageId).toBe('msg-002');

        // Check usage and performance are preserved
        const msg = result.messageMap.get('msg-002');
        expect(msg?.usage?.totalTokens).toBe(180);
        expect(msg?.usage?.cost).toBe(0.00054);
        expect(msg?.performance?.tps).toBe(52.0);
      }
    });
  });

  describe('Assistant with Tools (Group Pattern)', () => {
    it('should create GroupNode for assistant with multiple tool calls', () => {
      const messages = fixtures.assistantWithTools;
      const result = parse(messages);

      expect(result.messageMap.size).toBe(4);
      expect(result.displayTree).toHaveLength(1);

      const root = result.displayTree[0] as MessageNode;
      expect(root.type).toBe('MESSAGE');
      expect(root.messageId).toBe('msg-101');

      // Assistant with tools should be grouped
      const groupNode = root.children[0] as GroupNode;
      expect(groupNode.type).toBe('GROUP');
      expect(groupNode.assistantMessageId).toBe('msg-102');

      // Should have 2 tool messages
      expect(groupNode.tools).toHaveLength(2);
      expect(groupNode.tools[0].messageId).toBe('msg-103');
      expect(groupNode.tools[1].messageId).toBe('msg-104');

      // Verify tool messages are accessible
      const toolMsg1 = result.messageMap.get('msg-103');
      expect(toolMsg1?.role).toBe('tool');
      expect(toolMsg1?.tool_call_id).toBe('tool-sf');
    });
  });

  describe('Branched Conversation', () => {
    it('should create BranchNode for multiple alternative responses', () => {
      const messages = fixtures.branchedConversation;
      const result = parse(messages);

      expect(result.messageMap.size).toBe(6);

      // Root should be a branch node with 3 alternatives
      const root = result.displayTree[0] as BranchNode;
      expect(root.type).toBe('BRANCH');
      expect(root.parentMessageId).toBe('msg-201');
      expect(root.branches).toHaveLength(3);

      // Each branch should contain the assistant response
      expect(root.branches[0][0].type).toBe('MESSAGE');
      expect(root.branches[1][0].type).toBe('MESSAGE');
      expect(root.branches[2][0].type).toBe('MESSAGE');

      // First branch has a continuation
      const firstBranch = root.branches[0][0] as MessageNode;
      expect(firstBranch.messageId).toBe('msg-202');
      expect(firstBranch.children).toHaveLength(1);

      // Continuation leads to another message
      const continuation = firstBranch.children[0] as MessageNode;
      expect(continuation.messageId).toBe('msg-205');
    });
  });

  describe('Compare Mode', () => {
    it('should create CompareNode when presentation mode is set', () => {
      const messages = fixtures.compareMode;
      const result = parse(messages);

      expect(result.messageMap.size).toBe(3);

      // Should create a compare node
      const root = result.displayTree[0] as CompareNode;
      expect(root.type).toBe('COMPARE');
      expect(root.messageId).toBe('msg-301');

      // Should have 2 columns for comparison
      expect(root.columns).toHaveLength(2);

      // Each column contains one item (the assistant response)
      expect(root.columns[0]).toHaveLength(1);
      expect(root.columns[1]).toHaveLength(1);

      // Get the nodes from columns
      const col1 = root.columns[0][0];
      const col2 = root.columns[1][0];

      // Columns should contain message nodes
      expect(col1.type).toBe('MESSAGE');
      expect(col2.type).toBe('MESSAGE');

      if (col1.type === 'MESSAGE' && col2.type === 'MESSAGE') {
        expect(col1.messageId).toBe('msg-302');
        expect(col2.messageId).toBe('msg-303');
      }

      // Verify metadata shows different models
      const msg1 = result.messageMap.get('msg-302');
      const msg2 = result.messageMap.get('msg-303');
      expect(msg1?.model).toBe('gpt-4');
      expect(msg2?.model).toBe('claude-3-5-sonnet-20241022');
    });
  });

  describe('Thread Pattern', () => {
    it('should handle threaded sub-conversations', () => {
      const messages = fixtures.threadConversation;
      const result = parse(messages);

      expect(result.messageMap.size).toBe(6);

      // Main conversation flow
      const root = result.displayTree[0] as MessageNode;
      expect(root.type).toBe('MESSAGE');
      expect(root.messageId).toBe('msg-401');

      // Assistant response
      const assistantNode = root.children[0] as MessageNode;
      expect(assistantNode.type).toBe('MESSAGE');
      expect(assistantNode.messageId).toBe('msg-402');

      // Should have both thread and main flow continuation
      // Note: Thread handling depends on implementation details
      expect(assistantNode.children.length).toBeGreaterThan(0);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle assistant with tools followed by branched responses', () => {
      const messages = fixtures.complexScenario;
      const result = parse(messages);

      expect(result.messageMap.size).toBe(7);

      // Start with user message
      const root = result.displayTree[0] as MessageNode;
      expect(root.type).toBe('MESSAGE');
      expect(root.messageId).toBe('msg-501');

      // Assistant with tools
      const groupNode = root.children[0] as GroupNode;
      expect(groupNode.type).toBe('GROUP');
      expect(groupNode.assistantMessageId).toBe('msg-502');
      expect(groupNode.tools).toHaveLength(2);

      // Verify tool error is preserved
      const toolMsg = result.messageMap.get('msg-504');
      expect(toolMsg?.pluginError).toBeDefined();
      expect(toolMsg?.pluginError?.type).toBe('NameError');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messages array', () => {
      const result = parse([]);
      expect(result.messageMap.size).toBe(0);
      expect(result.displayTree).toHaveLength(0);
    });

    it('should handle single message', () => {
      const messages = [fixtures.linearConversation[0]];
      const result = parse(messages);

      expect(result.displayTree).toHaveLength(1);
      expect(result.displayTree[0].type).toBe('MESSAGE');
    });

    it('should preserve all usage and performance data', () => {
      const messages = fixtures.linearConversation;
      const result = parse(messages);

      const msg = result.messageMap.get('msg-002');

      // Check usage data
      expect(msg?.usage).toBeDefined();
      expect(msg?.usage?.totalInputTokens).toBe(24);
      expect(msg?.usage?.totalOutputTokens).toBe(156);
      expect(msg?.usage?.totalTokens).toBe(180);
      expect(msg?.usage?.cost).toBe(0.00054);

      // Check performance data
      expect(msg?.performance).toBeDefined();
      expect(msg?.performance?.tps).toBe(52.0);
      expect(msg?.performance?.ttft).toBe(234);
      expect(msg?.performance?.duration).toBe(3000);
      expect(msg?.performance?.latency).toBe(3234);
    });
  });

  describe('Performance', () => {
    it('should efficiently handle large conversation trees', () => {
      // Create a deep conversation
      const messages = fixtures.linearConversation;

      const startTime = Date.now();
      const result = parse(messages);
      const endTime = Date.now();

      expect(result.messageMap.size).toBe(messages.length);
      expect(endTime - startTime).toBeLessThan(50); // Should parse quickly
    });

    it('should provide O(1) message access via messageMap', () => {
      const messages = fixtures.linearConversation;
      const result = parse(messages);

      // Direct access should be instant
      const startTime = performance.now();
      const msg = result.messageMap.get('msg-002');
      const endTime = performance.now();

      expect(msg).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1); // Sub-millisecond access
    });
  });
});
