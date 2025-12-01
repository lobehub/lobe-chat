import { AgentBuilderApiName } from '../type';
import AvailableModels from './AvailableModels';
import AvailableTools from './AvailableTools';
import CreateAgent from './CreateAgent';
import GetAgentInfo from './GetAgentInfo';
import ToolConfig from './ToolConfig';
import UpdateResult from './UpdateResult';

/**
 * Agent Builder Render Components Registry
 */
export const AgentBuilderRenders = {
  // Query APIs
  [AgentBuilderApiName.getAgentInfo]: GetAgentInfo,
  [AgentBuilderApiName.listAvailableModels]: AvailableModels,
  [AgentBuilderApiName.listAvailableTools]: AvailableTools,

  // Create/Update APIs
  [AgentBuilderApiName.createAgent]: CreateAgent,
  [AgentBuilderApiName.updateAgentMeta]: UpdateResult,
  [AgentBuilderApiName.updateChatConfig]: UpdateResult,
  [AgentBuilderApiName.updateModelConfig]: UpdateResult,
  [AgentBuilderApiName.updateOpeningConfig]: UpdateResult,
  [AgentBuilderApiName.updateSystemRole]: UpdateResult,

  // Tool Configuration APIs
  [AgentBuilderApiName.disableTool]: ToolConfig,
  [AgentBuilderApiName.enableTool]: ToolConfig,

  // Knowledge Base APIs (reuse UpdateResult)
  [AgentBuilderApiName.addKnowledgeBase]: UpdateResult,
  [AgentBuilderApiName.removeKnowledgeBase]: UpdateResult,
};
