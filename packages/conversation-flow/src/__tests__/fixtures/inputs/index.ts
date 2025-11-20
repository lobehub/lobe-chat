import type { Message } from '../../../types';
import { assistantGroup } from './assistantGroup';
import { branch } from './branch';
import { compare } from './compare';
import linearConversation from './linear-conversation.json';

export const inputs = {
  assistantGroup,
  branch,
  compare,
  linearConversation: linearConversation as Message[],
};
