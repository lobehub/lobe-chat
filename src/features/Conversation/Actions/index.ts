import { RenderAction } from '../types';
import { AssistantActionsBar } from './Assistant';
import { DefaultActionsBar } from './Fallback';
import { ToolActionsBar } from './Tool';

export const renderActions: Record<string, RenderAction> = {
  assistant: AssistantActionsBar,
  system: DefaultActionsBar,
  tool: ToolActionsBar,
};
