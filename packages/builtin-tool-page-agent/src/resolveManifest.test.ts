import { describe, expect, it } from 'vitest';

import { htmlPageSystemPrompt, resolvePageAgentManifest } from './resolveManifest';

const apiNames = (pageDocumentType?: 'html' | 'rich-text') =>
  resolvePageAgentManifest({ pageDocumentType, scope: 'page' })!.api.map((api) => api.name);

describe('resolvePageAgentManifest', () => {
  it('gives an HTML page only the HTML APIs and an HTML system role', () => {
    const manifest = resolvePageAgentManifest({ pageDocumentType: 'html', scope: 'page' })!;

    expect(apiNames('html')).toEqual(['readHtml', 'editHtml', 'writeHtml']);
    expect(manifest.systemRole).toBe(htmlPageSystemPrompt);
    expect(manifest.systemRole).not.toMatch(/modifyNodes|XML-structured/);
  });

  it('hides the HTML APIs on a rich-text or unknown page', () => {
    for (const type of ['rich-text', undefined] as const) {
      const names = apiNames(type);
      expect(names).toContain('modifyNodes');
      expect(names).not.toContain('readHtml');
      expect(names).not.toContain('writeHtml');
    }
  });
});
