import { describe, expect, it } from 'vitest';

import {
  buildAgentShareChatPath,
  buildAgentShareOwnerPath,
  buildAgentShareProfilePath,
  buildAgentShareSignInUrl,
  buildAgentShareVisitorPath,
} from './visitorPath';

describe('visitorPath', () => {
  it('builds the visitor page path under /a', () => {
    expect(buildAgentShareVisitorPath('my-bot')).toBe('/a/my-bot');
  });

  it('returns a signed-in visitor to the same share', () => {
    expect(buildAgentShareSignInUrl('my-bot')).toBe('/signin?callbackUrl=%2Fa%2Fmy-bot');
  });

  it('builds a bookmarkable topic path and preserves it through sign-in', () => {
    expect(buildAgentShareVisitorPath('my-bot', 'tpc_1')).toBe('/a/my-bot/chat/tpc_1');
    expect(buildAgentShareSignInUrl('my-bot', 'tpc_1')).toBe(
      '/signin?callbackUrl=%2Fa%2Fmy-bot%2Fchat%2Ftpc_1',
    );
  });

  it('separates the profile landing surface from the conversation surface', () => {
    expect(buildAgentShareProfilePath('my-bot')).toBe('/a/my-bot');
    expect(buildAgentShareChatPath('my-bot')).toBe('/a/my-bot/chat');
    expect(buildAgentShareChatPath('my-bot', 'tpc_1')).toBe('/a/my-bot/chat/tpc_1');
  });

  describe('buildAgentShareOwnerPath', () => {
    it('sends the creator to the share settings on desktop', () => {
      expect(buildAgentShareOwnerPath('agt_1')).toBe('/agent/agt_1/share');
    });

    it('sends the creator to the agent itself on mobile, which has no share settings page', () => {
      expect(buildAgentShareOwnerPath('agt_1', { mobile: true })).toBe('/agent/agt_1');
    });
  });
});
