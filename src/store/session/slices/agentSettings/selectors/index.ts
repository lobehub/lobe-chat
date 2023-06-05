import {
  agentListSel,
  currentAgentSel,
  currentAgentTitleSel,
  currentAgentWithFlowSel,
  getAgentById,
} from './agent';

export const agentSelectors = {
  currentAgent: currentAgentSel,
  currentAgentWithFlow: currentAgentWithFlowSel,
  agentList: agentListSel,
  currentAgentSlicedTitle: currentAgentTitleSel,
  getAgentById,
};
