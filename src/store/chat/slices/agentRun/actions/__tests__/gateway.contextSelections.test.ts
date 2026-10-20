import type { ContextSelection, PageSelection } from '@lobechat/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { aiAgentService } from '@/services/aiAgent';

import { GatewayActionImpl } from '../transports/gateway/gateway';

vi.mock('@/services/aiAgent', () => ({
  aiAgentService: { execAgentTask: vi.fn(), interruptTask: vi.fn() },
}));

const contextSelections: ContextSelection[] = [
  { content: 'Quoted reply', format: 'text', id: 'selection-1', source: 'text' },
];
const pageSelections: PageSelection[] = [
  { content: 'Selected paragraph', id: 'page-selection-1', pageId: 'page-1' },
];

describe('executeGatewayAgent: attached selections', () => {
  beforeEach(() => {
    (globalThis as any).window = {
      global_serverConfigStore: {
        getState: () => ({ serverConfig: { agentGatewayUrl: 'https://gateway.test.com' } }),
      },
    };
    // Stop right after the start request; only its payload matters here.
    vi.mocked(aiAgentService.execAgentTask).mockRejectedValue(new Error('stop'));
  });

  afterEach(() => {
    delete (globalThis as any).window;
    vi.clearAllMocks();
  });

  // The server persists the user row on this path and replaces the optimistic
  // one with it. Without the selections in the start request, the quote the
  // user attached vanished from the bubble and never reached the agent.
  it('forwards the selections to the server start request', async () => {
    const action = new GatewayActionImpl(vi.fn(), () => ({ topicDataMap: {} }) as any, undefined);

    await expect(
      action.executeGatewayAgent({
        context: { agentId: 'agent-1', topicId: 'topic-1' },
        contextSelections,
        message: 'Explain this',
        pageSelections,
      }),
    ).rejects.toThrow('stop');

    expect(aiAgentService.execAgentTask).toHaveBeenCalledWith(
      expect.objectContaining({ contextSelections, pageSelections }),
    );
  });
});
