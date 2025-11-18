import type { Message, ParseResult } from '../../types';
// Input fixtures
import assistantChainWithFollowupInput from './inputs/assistant-chain-with-followup.json';
import { assistantGroup as assistantGroupInputs } from './inputs/assistantGroup';
import { branch as branchInputs } from './inputs/branch';
import { compare as compareInputs } from './inputs/compare';
import linearConversationInput from './inputs/linear-conversation.json';
// Output fixtures
import assistantChainWithFollowupOutput from './outputs/assistant-chain-with-followup.json';
import { assistantGroup as assistantGroupOutputs } from './outputs/assistantGroup';
import { branch as branchOutputs } from './outputs/branch';
import { compare as compareOutputs } from './outputs/compare';
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
  assistantGroup: assistantGroupInputs,
  branch: branchInputs,
  compare: compareInputs,
  linearConversation: linearConversationInput as Message[],
};

/**
 * Test output fixtures - expected parse results
 */
export const outputs = {
  assistantChainWithFollowup: assistantChainWithFollowupOutput as unknown as SerializedParseResult,
  assistantGroup: assistantGroupOutputs,
  branch: branchOutputs,
  compare: compareOutputs,
  linearConversation: linearConversationOutput as unknown as SerializedParseResult,
};
