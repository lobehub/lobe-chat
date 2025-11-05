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
      const result = parse(inputs.branchedConversation);

      expect(serializeParseResult(result)).toEqual(outputs.branchedConversation);
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
