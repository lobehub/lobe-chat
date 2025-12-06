import { AgentBuilderApiName } from '../types';
import GetAvailableModels from './GetAvailableModels';
import GetAvailableTools from './GetAvailableTools';
import GetConfig from './GetConfig';
import GetMeta from './GetMeta';
import GetPrompt from './GetPrompt';
import SetModel from './SetModel';
import SetOpeningMessage from './SetOpeningMessage';
import SetOpeningQuestions from './SetOpeningQuestions';
import TogglePlugin from './TogglePlugin';
import UpdateChatConfig from './UpdateChatConfig';
import UpdateConfig from './UpdateConfig';
import UpdateMeta from './UpdateMeta';
import UpdatePrompt from './UpdatePrompt';

/**
 * Agent Builder Render Components Registry
 */
export const AgentBuilderRenders = {
  // Read operations
  [AgentBuilderApiName.getAgentConfig]: GetConfig,
  [AgentBuilderApiName.getAgentMeta]: GetMeta,
  [AgentBuilderApiName.getAvailableModels]: GetAvailableModels,
  [AgentBuilderApiName.getAvailableTools]: GetAvailableTools,
  [AgentBuilderApiName.getPrompt]: GetPrompt,

  // Write operations
  [AgentBuilderApiName.updateAgentConfig]: UpdateConfig,
  [AgentBuilderApiName.updateAgentMeta]: UpdateMeta,
  [AgentBuilderApiName.updateChatConfig]: UpdateChatConfig,
  [AgentBuilderApiName.updatePrompt]: UpdatePrompt,

  // Specific field operations
  [AgentBuilderApiName.togglePlugin]: TogglePlugin,
  [AgentBuilderApiName.setModel]: SetModel,
  [AgentBuilderApiName.setOpeningMessage]: SetOpeningMessage,
  [AgentBuilderApiName.setOpeningQuestions]: SetOpeningQuestions,
};
