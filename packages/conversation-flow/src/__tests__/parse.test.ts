import { describe, expect, it } from 'vitest';

import { parse } from '../parse';
import { inputs, outputs } from './fixtures';

function serializeParseResult(result: ReturnType<typeof parse>) {
  return {
    contextTree: result.contextTree,
    flatList: result.flatList,
    messageMap: result.messageMap,
  };
}

describe('parse', () => {
  describe('Basic Conversations', () => {
    it('should parse linear conversation correctly', () => {
      const result = parse(inputs.linearConversation);

      expect(serializeParseResult(result)).toEqual(outputs.linearConversation);
    });
  });

  describe('Tool Usage', () => {
    it('should parse assistant with tools correctly', () => {
      const result = parse(inputs.assistantGroup.assistantWithTools);

      expect(serializeParseResult(result)).toEqual(outputs.assistantGroup.assistantWithTools);
    });

    it('should include follow-up messages after assistant chain', () => {
      const result = parse(inputs.assistantChainWithFollowup);

      // The critical assertion: flatList should contain all 5 messages
      // msg-1 (user) + assistantGroup (msg-2+msg-3+tool-1) + msg-4 (user follow-up)
      expect(result.flatList).toHaveLength(3);
      expect(result.flatList[0].id).toBe('msg-1');
      expect(result.flatList[1].role).toBe('assistantGroup');
      expect(result.flatList[2].id).toBe('msg-4'); // This is the critical one that might be missing

      expect(serializeParseResult(result)).toEqual(outputs.assistantChainWithFollowup);
    });
  });

  describe('Branching', () => {
    it('should parse branched conversation correctly', () => {
      const result = parse(inputs.branch.conversation);

      expect(serializeParseResult(result)).toEqual(outputs.branch.conversation);
    });

    it('should respect activeBranchIndex when specified', () => {
      const result = parse(inputs.branch.activeIndex1);

      expect(serializeParseResult(result)).toEqual(outputs.branch.activeIndex1);
    });

    it('should handle assistant message with branches', () => {
      const result = parse(inputs.branch.assistantBranch);

      expect(serializeParseResult(result)).toEqual(outputs.branch.assistantBranch);
    });

    it('should handle assistant with user branches', () => {
      const result = parse(inputs.branch.assistantUserBranch);

      expect(serializeParseResult(result)).toEqual(outputs.branch.assistantUserBranch);
    });

    it('should handle deeply nested branches (4 levels)', () => {
      const result = parse(inputs.branch.nested);

      expect(serializeParseResult(result)).toEqual(outputs.branch.nested);
    });

    it('should handle multiple assistant group branches', () => {
      const result = parse(inputs.branch.multiAssistantGroup);

      expect(serializeParseResult(result)).toEqual(outputs.branch.multiAssistantGroup);
    });

    it('should handle assistant group with branches', () => {
      const result = parse(inputs.branch.assistantGroupBranches);

      expect(serializeParseResult(result)).toEqual(outputs.branch.assistantGroupBranches);
    });
  });

  describe('Compare Mode', () => {
    it('should parse simple compare mode correctly', () => {
      const result = parse(inputs.compare.simple);

      expect(serializeParseResult(result)).toEqual(outputs.compare.simple);
    });

    it('should parse compare mode with tools correctly', () => {
      const result = parse(inputs.compare.withTools);

      expect(serializeParseResult(result)).toEqual(outputs.compare.withTools);
    });
  });

  describe('Assistant Group Scenarios', () => {
    it('should handle tools with assistant branches correctly', () => {
      const result = parse(inputs.assistantGroup.toolsWithBranches);

      expect(serializeParseResult(result)).toEqual(outputs.assistantGroup.toolsWithBranches);
    });
  });

  describe('Performance', () => {
    it('should parse 10000 items within 50ms', () => {
      // Generate 10000 messages as flat siblings (no deep nesting to avoid stack overflow)
      // This simulates a more realistic scenario where messages are not deeply nested
      const largeInput = Array.from({ length: 10000 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
        content: `Message ${i}`,
        parentId: undefined, // All messages at the same level
        createdAt: Date.now() + i,
      }));

      const startTime = performance.now();
      const result = parse(largeInput as any[]);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      expect(result.flatList.length).toBeGreaterThan(0);
      expect(executionTime).toBeLessThan(50);
    });
  });
});
