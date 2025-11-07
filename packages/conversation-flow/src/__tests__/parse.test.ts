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
      const result = parse(inputs.assistantWithTools);

      expect(serializeParseResult(result)).toEqual(outputs.assistantWithTools);
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

  describe('Complex Scenarios', () => {
    it('should handle complex mixed scenarios correctly', () => {
      const result = parse(inputs.complexScenario);

      expect(serializeParseResult(result)).toEqual(outputs.complexScenario);
    });
  });
});
