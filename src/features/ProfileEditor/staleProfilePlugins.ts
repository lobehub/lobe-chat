import { type AgentPluginEntry, parsePluginEntry } from '@lobechat/types';

import type { ToolStoreState } from '@/store/tool/initialState';
import { AGENT_SKILL_LIST_KEY } from '@/store/tool/slices/agentSkills/projection';
import { UNINSTALLED_BUILTIN_TOOLS_KEY } from '@/store/tool/slices/builtin/projection';
import { CONNECTOR_LIST_KEY } from '@/store/tool/slices/connector/projection';
import { INSTALLED_PLUGINS_KEY } from '@/store/tool/slices/plugin/projection';

/**
 * Whether every asynchronously loaded catalog that feeds `validIdentifiers`
 * holds the server's answer. An unloaded catalog is empty, and a catalog
 * hydrated from IndexedDB can predate a tool installed on another device, so
 * pruning against either would delete valid tools and persist the loss. This
 * includes custom connectors: `isConnectorsInit` already turns true on the
 * IndexedDB hydrate, before the server list arrives.
 *
 * @see https://github.com/lobehub/lobehub/issues/18856
 */
export const selectProfileToolCatalogsSynced = (s: ToolStoreState): boolean =>
  s.installedPluginsReplica.entries[INSTALLED_PLUGINS_KEY]?.source === 'server' &&
  s.connectorsReplica.entries[CONNECTOR_LIST_KEY]?.source === 'server' &&
  s.uninstalledBuiltinToolsReplica.entries[UNINSTALLED_BUILTIN_TOOLS_KEY]?.source === 'server' &&
  s.agentSkillListReplica.entries[AGENT_SKILL_LIST_KEY]?.source === 'server';

export interface StalePluginCleanupInput {
  /**
   * Workspace role permits editing own content (`edit_own_content`). Personal
   * mode is always `true`.
   */
  canEditContent: boolean;
  /**
   * Workspace General access on this agent resolves to "may edit". Defaults
   * permissive outside a workspace.
   */
  canEditResource: boolean;
  /**
   * The workspace access query has settled. Cleanup waits for it rather than
   * running on the permissive loading default.
   */
  isAccessResolved: boolean;
  /**
   * Connector identifiers are absent from `validIdentifiers` until
   * `fetchConnectors()` resolves, so pruning before that would mark enabled
   * connectors as stale.
   */
  isConnectorsInit: boolean;
  /**
   * Installed plugins, custom connectors, installed builtin tools and agent
   * skills have all been loaded from the server
   * (`selectProfileToolCatalogsSynced`), and the server config that decides the
   * connector catalog has loaded successfully. Until then a
   * valid custom tool is missing from `validIdentifiers`.
   */
  isToolCatalogSynced: boolean;
  plugins: AgentPluginEntry[] | undefined;
  validIdentifiers: ReadonlySet<string>;
}

/**
 * Decide whether the agent profile should silently drop plugin entries whose
 * identifier no longer resolves to any known tool, and to what.
 *
 * Returns the cleaned list when a write is warranted, or `null` to leave the
 * config alone.
 *
 * The permission inputs matter as much as the staleness ones (automatic corrections must not trigger phantom save-error toasts): this
 * cleanup is automatic, so in a workspace a caller without resource edit access
 * would fire an `agent.updateAgentConfig` the server rejects — and because the
 * rejected write never persists, it would fire and fail again on *every* open,
 * surfacing "Failed to save agent settings" on an agent the user only viewed.
 * Fail closed while access is still resolving.
 */
export const resolveStalePluginCleanup = ({
  canEditContent,
  canEditResource,
  isAccessResolved,
  isConnectorsInit,
  isToolCatalogSynced,
  plugins,
  validIdentifiers,
}: StalePluginCleanupInput): AgentPluginEntry[] | null => {
  if (!canEditContent || !isAccessResolved || !canEditResource) return null;
  if (!isConnectorsInit || !isToolCatalogSynced) return null;
  if (validIdentifiers.size === 0) return null;

  const rawPlugins = plugins ?? [];
  if (rawPlugins.length === 0) return null;

  // Checked (and filtered) by identifier regardless of entry shape, so a stale
  // disabled/pinned object entry is pruned exactly like a stale legacy string
  // one — untouched valid entries keep their original shape (lazy per-item
  // upgrade).
  const isValid = (entry: AgentPluginEntry) =>
    validIdentifiers.has(parsePluginEntry(entry).identifier);

  if (rawPlugins.every(isValid)) return null;

  return rawPlugins.filter(isValid);
};
