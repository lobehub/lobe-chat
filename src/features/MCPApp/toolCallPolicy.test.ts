import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppToolCallPolicy } from './toolCallPolicy';

const { connectors, plugins } = vi.hoisted(() => ({
  connectors: new Map<string, unknown>(),
  plugins: new Map<string, unknown>(),
}));

vi.mock('@/store/tool', () => ({ getToolStoreState: () => ({}) }));

vi.mock('@/store/tool/selectors', () => ({
  pluginSelectors: {
    getCustomPluginById: () => () => undefined,
    getInstalledPluginById: (id: string) => () => plugins.get(id),
  },
}));

vi.mock('@/store/tool/slices/connector', () => ({
  connectorSelectors: {
    connectorByIdentifierForAgent: (id: string) => () => connectors.get(id),
  },
}));

const connector = (permission: string) => ({
  isEnabled: true,
  mcpServerUrl: 'https://mcp.example.com/mcp',
  tools: [{ permission, toolName: 'send' }],
});

const plugin = (humanIntervention?: string) => ({
  manifest: { api: [{ humanIntervention, name: 'send' }] },
});

describe('getAppToolCallPolicy', () => {
  beforeEach(() => {
    connectors.clear();
    plugins.clear();
  });

  it('asks before running a connector tool that needs approval', () => {
    connectors.set('mail', connector('needs_approval'));
    expect(getAppToolCallPolicy('mail', 'send')).toBe('confirm');
  });

  it('runs auto connector tools and refuses disabled or unknown ones', () => {
    connectors.set('mail', connector('auto'));
    expect(getAppToolCallPolicy('mail', 'send')).toBe('allow');
    expect(getAppToolCallPolicy('mail', 'delete')).toBe('deny');

    connectors.set('mail', connector('disabled'));
    expect(getAppToolCallPolicy('mail', 'send')).toBe('deny');
  });

  it('follows the plugin manifest humanIntervention', () => {
    plugins.set('weather', plugin('required'));
    expect(getAppToolCallPolicy('weather', 'send')).toBe('confirm');

    plugins.set('weather', plugin('never'));
    expect(getAppToolCallPolicy('weather', 'send')).toBe('allow');

    plugins.set('weather', plugin());
    expect(getAppToolCallPolicy('weather', 'send')).toBe('allow');
    expect(getAppToolCallPolicy('weather', 'other')).toBe('deny');
  });

  it('asks for an agent tool the client has not loaded, refuses anything else unknown', () => {
    expect(getAppToolCallPolicy('agent-app', 'send', 'agt_1')).toBe('confirm');
    expect(getAppToolCallPolicy('agent-app', 'send')).toBe('deny');
  });
});
