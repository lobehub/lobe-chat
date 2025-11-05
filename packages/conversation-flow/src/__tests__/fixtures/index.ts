import type { Message, ParseResult } from '../../types';
// Input fixtures
import assistantWithToolsInput from './inputs/assistant-with-tools.json';
import { branch as branchInputs } from './inputs/branch';
import compareModeInput from './inputs/compare-mode.json';
import complexScenarioInput from './inputs/complex-scenario.json';
import linearConversationInput from './inputs/linear-conversation.json';
// Output fixtures
import assistantWithToolsOutput from './outputs/assistant-with-tools.json';
import { branch as branchOutputs } from './outputs/branch';
import compareModeOutput from './outputs/compare-mode.json';
import complexScenarioOutput from './outputs/complex-scenario.json';
import linearConversationOutput from './outputs/linear-conversation.json';

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
  branch: branchInputs,
  compareMode: compareModeInput as Message[],
  complexScenario: complexScenarioInput as Message[],
  linearConversation: linearConversationInput as Message[],
};

/**
 * Test output fixtures - expected parse results
 */
export const outputs = {
  assistantWithTools: assistantWithToolsOutput as unknown as SerializedParseResult,
  branch: branchOutputs,
  compareMode: compareModeOutput as unknown as SerializedParseResult,
  complexScenario: complexScenarioOutput as unknown as SerializedParseResult,
  linearConversation: linearConversationOutput as unknown as SerializedParseResult,
};
