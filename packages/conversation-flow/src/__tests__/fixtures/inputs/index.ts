import type { Message } from '../../../types';
import { agentCouncil } from './agentCouncil';
import { assistantGroup } from './assistantGroup';
import { branch } from './branch';
import { compare } from './compare';
import linearConversation from './linear-conversation.json';

export const inputs = {
  agentCouncil,
  assistantGroup,
  branch,
  compare,
  linearConversation: linearConversation as Message[],
};
