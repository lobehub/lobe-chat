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
  describe('Snapshot Tests', () => {
    it('should match snapshot for linear conversation', () => {
      const result = parse(inputs.linearConversation);

      expect(serializeParseResult(result)).toEqual(outputs.linearConversation);
    });

    it('should match snapshot for assistant with tools', () => {
      const result = parse(inputs.assistantWithTools);

      expect(serializeParseResult(result)).toEqual(outputs.assistantWithTools);
    });

    it('should match snapshot for branched conversation', () => {
      const result = parse(inputs.branch.conversation);

      expect(serializeParseResult(result)).toEqual(outputs.branch.conversation);
    });

    it('should match snapshot for branched conversation with activeBranchIndex 1', () => {
      const result = parse(inputs.branch.activeIndex1);

      expect(serializeParseResult(result)).toEqual(outputs.branch.activeIndex1);
    });

    it('should match snapshot for assistant message with branches', () => {
      const result = parse(inputs.branch.assistantBranch);

      expect(serializeParseResult(result)).toEqual(outputs.branch.assistantBranch);
    });

    it('should match snapshot for assistant with user branches', () => {
      const result = parse(inputs.branch.assistantUserBranch);

      expect(serializeParseResult(result)).toEqual(outputs.branch.assistantUserBranch);
    });

    it('should match snapshot for nested branches (4 levels)', () => {
      const result = parse(inputs.branch.nested);

      expect(serializeParseResult(result)).toEqual(outputs.branch.nested);
    });

    it('should match snapshot for compare mode', () => {
      const result = parse(inputs.compareMode);

      expect(serializeParseResult(result)).toEqual(outputs.compareMode);
    });

    it('should match snapshot for complex scenario', () => {
      const result = parse(inputs.complexScenario);

      expect(serializeParseResult(result)).toEqual(outputs.complexScenario);
    });
  });
});
