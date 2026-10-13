import { describe, expect, it } from 'vitest';

import {
  checkOrigins,
  inviteDaysLeft,
  originErrorFromServer,
  reviewLink,
  siteSnippet,
} from './siteSnippet';

describe('siteSnippet', () => {
  it('omits the server for LobeHub cloud', () => {
    expect(siteSnippet('site_7f3k9q2mAbCd', 'https://app.lobehub.com')).toBe(
      '<script src="https://web-assets.lobehub.com/review-sdk/assets/v1/lobehub-review.js" data-site="site_7f3k9q2mAbCd"></script>',
    );
  });

  it('names a self-hosted server', () => {
    expect(siteSnippet('site_7f3k9q2mAbCd', 'http://localhost:3010')).toContain(
      'data-site="site_7f3k9q2mAbCd" data-server="http://localhost:3010"',
    );
  });
});

describe('reviewLink', () => {
  it('opens the first exact origin with the wake parameter', () => {
    expect(reviewLink(['https://*.fieldnotes.app', 'https://fieldnotes.app'])).toBe(
      'https://fieldnotes.app/?lh-review',
    );
  });

  it('has nothing to open when every origin is a wildcard', () => {
    expect(reviewLink(['https://*.fieldnotes.app'])).toBeNull();
  });
});

describe('checkOrigins', () => {
  it('reports each invalid origin by position and ignores blank rows', () => {
    expect(
      checkOrigins([
        'https://fieldnotes.app',
        '',
        'https://*.vercel.app',
        'http://192.168.1.5:3000',
      ]),
    ).toEqual([undefined, undefined, 'sharedHostWildcard', 'insecure']);
  });
});

describe('originErrorFromServer', () => {
  it('reads the index and reason from a rejected save', () => {
    expect(originErrorFromServer(new Error('invalidOrigin:2:path'))).toEqual({
      index: 2,
      reason: 'path',
    });
    expect(originErrorFromServer(new Error('Cannot manage review access'))).toBeUndefined();
  });
});

describe('inviteDaysLeft', () => {
  const now = Date.parse('2026-10-14T00:00:00Z');

  it('counts a part day as a whole one, so a fresh 7-day invite reads 7', () => {
    expect(inviteDaysLeft(new Date(now + 7 * 86_400_000 - 60_000), now)).toBe(7);
    expect(inviteDaysLeft(new Date(now + 3_600_000), now)).toBe(1);
  });

  it('never goes below zero', () => {
    expect(inviteDaysLeft(new Date(now - 86_400_000), now)).toBe(0);
    expect(inviteDaysLeft(null, now)).toBe(0);
  });
});
