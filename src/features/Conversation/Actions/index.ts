import { RenderAction } from '../types';
import { AssistantActionsBar } from './Assistant';

export const renderActions: Record<string, RenderAction> = {
  assistant: AssistantActionsBar,
};
