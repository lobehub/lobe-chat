import { describe, expect, it } from 'vitest';

import { initialState, type ToolStoreState } from '@/store/tool/initialState';
import { AGENT_SKILL_LIST_KEY } from '@/store/tool/slices/agentSkills/projection';
import { UNINSTALLED_BUILTIN_TOOLS_KEY } from '@/store/tool/slices/builtin/projection';
import { CONNECTOR_LIST_KEY } from '@/store/tool/slices/connector/projection';
import { INSTALLED_PLUGINS_KEY } from '@/store/tool/slices/plugin/projection';

import {
  resolveStalePluginCleanup,
  selectProfileToolCatalogsSynced,
  type StalePluginCleanupInput,
} from './staleProfilePlugins';

const baseInput = (overrides: Partial<StalePluginCleanupInput> = {}): StalePluginCleanupInput => ({
  canEditContent: true,
  canEditResource: true,
  isAccessResolved: true,
  isConnectorsInit: true,
  isToolCatalogSynced: true,
  plugins: ['web-search', 'ghost-tool'],
  validIdentifiers: new Set(['web-search']),
  ...overrides,
});

describe('resolveStalePluginCleanup', () => {
  it('drops entries whose identifier no longer resolves', () => {
    expect(resolveStalePluginCleanup(baseInput())).toEqual(['web-search']);
  });

  it('keeps the original entry shape for surviving entries', () => {
    const result = resolveStalePluginCleanup(
      baseInput({
        plugins: [{ identifier: 'web-search', mode: 'disabled' }, 'ghost-tool'],
      }),
    );

    expect(result).toEqual([{ identifier: 'web-search', mode: 'disabled' }]);
  });

  it('returns null when nothing is stale, so no write is fired', () => {
    expect(
      resolveStalePluginCleanup(
        baseInput({ plugins: ['web-search'], validIdentifiers: new Set(['web-search']) }),
      ),
    ).toBeNull();
  });

  it('returns null before the connector store has loaded', () => {
    expect(resolveStalePluginCleanup(baseInput({ isConnectorsInit: false }))).toBeNull();
  });

  // https://github.com/lobehub/lobehub/issues/18856 — on a cold start the
  // installed-plugin list is still empty when the connectors load, so a bound
  // custom tool looked stale and the profile saved `plugins: []`.
  it('returns null while the tool catalogs are still loading', () => {
    expect(
      resolveStalePluginCleanup(
        baseInput({
          isToolCatalogSynced: false,
          plugins: ['web-search', 'my-custom-tool'],
          validIdentifiers: new Set(['web-search']),
        }),
      ),
    ).toBeNull();
  });

  it('returns null when no identifiers are known yet', () => {
    expect(resolveStalePluginCleanup(baseInput({ validIdentifiers: new Set() }))).toBeNull();
  });

  it('returns null for an agent with no plugins', () => {
    expect(resolveStalePluginCleanup(baseInput({ plugins: undefined }))).toBeNull();
    expect(resolveStalePluginCleanup(baseInput({ plugins: [] }))).toBeNull();
  });

  // automatic corrections must not trigger phantom save-error toasts: the cleanup is automatic, so firing it without edit access made
  // the server reject `agent.updateAgentConfig`; because the rejected write never
  // persists, it fired and failed again on every open, toasting "Failed to save
  // agent settings" on an agent the member had only opened.
  describe('permission gate (automatic corrections must not trigger phantom save-error toasts)', () => {
    it('does not clean up when the workspace role cannot edit content', () => {
      expect(resolveStalePluginCleanup(baseInput({ canEditContent: false }))).toBeNull();
    });

    it('does not clean up when General access on this agent is below edit', () => {
      expect(resolveStalePluginCleanup(baseInput({ canEditResource: false }))).toBeNull();
    });

    it('fails closed while workspace access is still resolving', () => {
      expect(
        resolveStalePluginCleanup(
          // `canEditResource` defaults permissive during loading, so the
          // resolved flag is what keeps the doomed write from being fired.
          baseInput({ canEditResource: true, isAccessResolved: false }),
        ),
      ).toBeNull();
    });
  });
});

describe('selectProfileToolCatalogsSynced', () => {
  type Source = 'local' | 'server' | 'storage';

  const entry = (source: Source) => ({ data: [], source }) as any;

  const stateWith = (sources: {
    agentSkills?: Source;
    connectors?: Source;
    installedPlugins?: Source;
    uninstalledBuiltinTools?: Source;
  }): ToolStoreState =>
    ({
      ...initialState,
      agentSkillListReplica: {
        ...initialState.agentSkillListReplica,
        entries: sources.agentSkills ? { [AGENT_SKILL_LIST_KEY]: entry(sources.agentSkills) } : {},
      },
      connectorsReplica: {
        ...initialState.connectorsReplica,
        entries: sources.connectors ? { [CONNECTOR_LIST_KEY]: entry(sources.connectors) } : {},
      },
      installedPluginsReplica: {
        ...initialState.installedPluginsReplica,
        entries: sources.installedPlugins
          ? { [INSTALLED_PLUGINS_KEY]: entry(sources.installedPlugins) }
          : {},
      },
      uninstalledBuiltinToolsReplica: {
        ...initialState.uninstalledBuiltinToolsReplica,
        entries: sources.uninstalledBuiltinTools
          ? { [UNINSTALLED_BUILTIN_TOOLS_KEY]: entry(sources.uninstalledBuiltinTools) }
          : {},
      },
    }) as ToolStoreState;

  it('is true once every catalog holds the server response', () => {
    expect(
      selectProfileToolCatalogsSynced(
        stateWith({
          agentSkills: 'server',
          connectors: 'server',
          installedPlugins: 'server',
          uninstalledBuiltinTools: 'server',
        }),
      ),
    ).toBe(true);
  });

  // `isConnectorsInit` is already true after the IndexedDB hydrate, so a
  // connector bound on another device would look stale until the server list lands.
  it('is false while the connector list only holds its persisted IndexedDB copy', () => {
    expect(
      selectProfileToolCatalogsSynced(
        stateWith({
          agentSkills: 'server',
          connectors: 'storage',
          installedPlugins: 'server',
          uninstalledBuiltinTools: 'server',
        }),
      ),
    ).toBe(false);
  });

  it('is false on a cold start before the installed plugins load', () => {
    expect(
      selectProfileToolCatalogsSynced(
        stateWith({ agentSkills: 'server', uninstalledBuiltinTools: 'server' }),
      ),
    ).toBe(false);
  });

  it('is false while a catalog only holds its persisted IndexedDB copy', () => {
    expect(
      selectProfileToolCatalogsSynced(
        stateWith({
          agentSkills: 'server',
          installedPlugins: 'storage',
          uninstalledBuiltinTools: 'server',
        }),
      ),
    ).toBe(false);
  });

  it('is false before the agent skills or builtin tool state loads', () => {
    expect(selectProfileToolCatalogsSynced(stateWith({ installedPlugins: 'server' }))).toBe(false);
  });
});
