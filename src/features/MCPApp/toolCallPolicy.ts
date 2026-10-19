import { getToolStoreState } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { connectorSelectors } from '@/store/tool/slices/connector';

/**
 * What LobeHub does with a `tools/call` a view sends. A view can call tools on
 * load without any user gesture, so a tool that would ask for approval in the
 * conversation must ask here too, and a tool the server doesn't offer is
 * refused before it reaches the server.
 */
export type AppToolCallPolicy = 'allow' | 'confirm' | 'deny';

const needsApproval = (intervention: unknown) => !!intervention && intervention !== 'never';

export const getAppToolCallPolicy = (
  identifier: string,
  toolName: string,
  agentId?: string,
): AppToolCallPolicy => {
  const s = getToolStoreState();

  const connector = connectorSelectors.connectorByIdentifierForAgent(identifier, agentId)(s);
  // Same routing as `mcpService.invokeMcpToolCall`
  if (
    connector?.isEnabled &&
    (!!connector.mcpServerUrl || connector.mcpConnectionType === 'stdio')
  ) {
    const tool = connector.tools.find((t) => t.toolName === toolName);
    if (!tool || tool.permission === 'disabled') return 'deny';
    return tool.permission === 'needs_approval' ? 'confirm' : 'allow';
  }

  const plugin =
    pluginSelectors.getInstalledPluginById(identifier)(s) ||
    pluginSelectors.getCustomPluginById(identifier)(s);
  if (!plugin) {
    // An agent's own connector the client hasn't loaded: its permissions are
    // unknown here, so ask.
    return agentId ? 'confirm' : 'deny';
  }

  const api = plugin.manifest?.api?.find((item) => item.name === toolName) as
    { humanIntervention?: unknown } | undefined;
  if (!api) return 'deny';

  return needsApproval(api.humanIntervention) ? 'confirm' : 'allow';
};
