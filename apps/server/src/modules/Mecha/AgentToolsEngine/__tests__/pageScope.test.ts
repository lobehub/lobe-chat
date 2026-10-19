// @vitest-environment node
import { PageAgentIdentifier } from '@lobechat/builtin-tool-page-agent';
import { describe, expect, it } from 'vitest';

import { createServerAgentToolsEngine } from '../index';

const context = { installedPlugins: [], isModelSupportToolUse: () => true };

const enabledToolIds = (chatConfig: Record<string, unknown>, scope: string) =>
  createServerAgentToolsEngine(context, {
    agentConfig: { chatConfig, plugins: [PageAgentIdentifier] },
    manifestContext: { scope },
    model: 'gpt-4',
    provider: 'openai',
  }).generateToolsDetailed({ model: 'gpt-4', provider: 'openai', toolIds: [PageAgentIdentifier] })
    .enabledToolIds;

describe('page tool in page scope', () => {
  it('stays on for an agent in chat mode, which ignores runtime plugins', () => {
    // Lobe AI is the page copilot; a user may run it in chat mode.
    expect(enabledToolIds({ enableAgentMode: false }, 'page')).toContain(PageAgentIdentifier);
  });

  it('is not forced outside page scope', () => {
    expect(enabledToolIds({ enableAgentMode: false }, 'main')).not.toContain(PageAgentIdentifier);
  });
});
