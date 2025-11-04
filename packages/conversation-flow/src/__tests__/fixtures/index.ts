import type { Message } from '../../types';
import assistantWithTools from './assistant-with-tools.json';
import branchedConversation from './branched-conversation.json';
import compareMode from './compare-mode.json';
import complexScenario from './complex-scenario.json';
import linearConversation from './linear-conversation.json';
import threadConversation from './thread-conversation.json';

/**
 * Fixture loader - provides typed access to test data
 */
export const fixtures = {
  assistantWithTools: assistantWithTools as Message[],
  branchedConversation: branchedConversation as Message[],
  compareMode: compareMode as Message[],
  complexScenario: complexScenario as Message[],
  linearConversation: linearConversation as Message[],
  threadConversation: threadConversation as Message[],
};
