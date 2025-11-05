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
