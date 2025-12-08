import { AgentBuilderApiName } from '../types';
import GetAvailableModels from './GetAvailableModels';
import InstallPlugin from './InstallPlugin';
import SearchMarketTools from './SearchMarketTools';
import SearchOfficialTools from './SearchOfficialTools';
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
 *
 * Note: GetConfig, GetMeta, GetPrompt, GetAvailableTools are removed
 * because the current agent context is now automatically injected into the conversation
 */
export const AgentBuilderRenders = {
  // Read operations
  [AgentBuilderApiName.getAvailableModels]: GetAvailableModels,
  [AgentBuilderApiName.searchMarketTools]: SearchMarketTools,
  [AgentBuilderApiName.searchOfficialTools]: SearchOfficialTools,

  // Write operations
  [AgentBuilderApiName.installPlugin]: InstallPlugin,
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
