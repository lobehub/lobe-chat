import type { Message, ParseResult } from '../../types';
// Input fixtures
import assistantChainWithFollowupInput from './inputs/assistant-chain-with-followup.json';
import assistantWithToolsInput from './inputs/assistant-with-tools.json';
import { branch as branchInputs } from './inputs/branch';
import { compare as compareInputs } from './inputs/compare';
import complexScenarioInput from './inputs/complex-scenario.json';
import linearConversationInput from './inputs/linear-conversation.json';
// Output fixtures
import assistantChainWithFollowupOutput from './outputs/assistant-chain-with-followup.json';
import assistantWithToolsOutput from './outputs/assistant-with-tools.json';
import { branch as branchOutputs } from './outputs/branch';
import { compare as compareOutputs } from './outputs/compare';
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
  assistantChainWithFollowup: assistantChainWithFollowupInput as Message[],
  assistantWithTools: assistantWithToolsInput as Message[],
  branch: branchInputs,
  compare: compareInputs,
  complexScenario: complexScenarioInput as Message[],
  linearConversation: linearConversationInput as Message[],
};

/**
 * Test output fixtures - expected parse results
 */
export const outputs = {
  assistantChainWithFollowup: assistantChainWithFollowupOutput as unknown as SerializedParseResult,
  assistantWithTools: assistantWithToolsOutput as unknown as SerializedParseResult,
  branch: branchOutputs,
  compare: compareOutputs,
  complexScenario: complexScenarioOutput as unknown as SerializedParseResult,
  linearConversation: linearConversationOutput as unknown as SerializedParseResult,
};
