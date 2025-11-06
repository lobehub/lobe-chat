import type { Message } from '../../../types';
import assistantWithTools from './assistant-with-tools.json';
import { branch } from './branch';
import { compare } from './compare';
import complexScenario from './complex-scenario.json';
import linearConversation from './linear-conversation.json';

export const inputs = {
  assistantWithTools: assistantWithTools as Message[],
  branch,
  compare,
  complexScenario: complexScenario as Message[],
  linearConversation: linearConversation as Message[],
};
