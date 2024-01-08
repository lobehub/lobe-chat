import { RenderMessageExtra } from '../types';
import { AssistantMessageExtra } from './Assistant';
import { UserMessageExtra } from './User';

export const renderMessagesExtra: Record<string, RenderMessageExtra> = {
  assistant: AssistantMessageExtra,
  user: UserMessageExtra,
};
