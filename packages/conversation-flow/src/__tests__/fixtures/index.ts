import type { Message, ParseResult } from '../../types';
// Input fixtures
import assistantWithToolsInput from './inputs/assistant-with-tools.json';
import branchedConversationInput from './inputs/branched-conversation.json';
import compareModeInput from './inputs/compare-mode.json';
import complexScenarioInput from './inputs/complex-scenario.json';
import linearConversationInput from './inputs/linear-conversation.json';
import threadConversationInput from './inputs/thread-conversation.json';
// Output fixtures
import assistantWithToolsOutput from './outputs/assistant-with-tools.json';
import branchedConversationOutput from './outputs/branched-conversation.json';
import compareModeOutput from './outputs/compare-mode.json';
import complexScenarioOutput from './outputs/complex-scenario.json';
import linearConversationOutput from './outputs/linear-conversation.json';
import threadConversationOutput from './outputs/thread-conversation.json';

/**
 * Serialized parse result type
 */
export interface SerializedParseResult {
  contextTree: ParseResult['contextTree'];
  flatList: ParseResult['flatList'];
  messageMap: Record<string, Message>;
}

/**
 * Test input fixtures - raw messages from database
 */
export const inputs = {
  assistantWithTools: assistantWithToolsInput as Message[],
  branchedConversation: branchedConversationInput as Message[],
  compareMode: compareModeInput as Message[],
  complexScenario: complexScenarioInput as Message[],
  linearConversation: linearConversationInput as Message[],
  threadConversation: threadConversationInput as Message[],
};

/**
 * Test output fixtures - expected parse results
 */
export const outputs = {
  assistantWithTools: assistantWithToolsOutput as SerializedParseResult,
  branchedConversation: branchedConversationOutput as SerializedParseResult,
  compareMode: compareModeOutput as SerializedParseResult,
  complexScenario: complexScenarioOutput as SerializedParseResult,
  linearConversation: linearConversationOutput as SerializedParseResult,
  threadConversation: threadConversationOutput as SerializedParseResult,
};

// For backward compatibility
export const fixtures = inputs;
