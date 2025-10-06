import { RenderMessageExtra } from '../types';
import { AssistantMessageExtra } from './Assistant';

export const renderMessagesExtra: Record<string, RenderMessageExtra> = {
  assistant: AssistantMessageExtra,
};
