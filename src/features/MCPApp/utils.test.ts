import { describe, expect, it } from 'vitest';

import { buildAppCsp, injectCsp, pickAppResource, toCallToolResult } from './utils';

describe('pickAppResource', () => {
  it('picks the matching text entry with its ui meta', () => {
    const resource = pickAppResource(
      {
        contents: [
          { text: 'other', uri: 'ui://other' },
          { _meta: { ui: { prefersBorder: false } }, text: '<p>hi</p>', uri: 'ui://app' },
        ],
      },
      'ui://app',
    );

    expect(resource).toEqual({ html: '<p>hi</p>', meta: { prefersBorder: false } });
  });

  it('decodes base64 blobs as UTF-8', () => {
    const blob = btoa(String.fromCharCode(...new TextEncoder().encode('<p>你好</p>')));

    expect(pickAppResource({ contents: [{ blob, uri: 'ui://app' }] }, 'ui://app')?.html).toBe(
      '<p>你好</p>',
    );
  });

  it('returns undefined for empty results', () => {
    expect(pickAppResource(undefined, 'ui://app')).toBeUndefined();
    expect(pickAppResource({ contents: [] }, 'ui://app')).toBeUndefined();
  });
});

describe('buildAppCsp', () => {
  it('blocks the network by default', () => {
    const csp = buildAppCsp(undefined);

    expect(csp).toContain(`default-src 'none'`);
    expect(csp).toContain(`connect-src 'none'`);
    expect(csp).toContain(`frame-src 'none'`);
  });

  it('allows declared domains and drops ones that could break out of the policy', () => {
    const csp = buildAppCsp({
      connectDomains: ['https://api.example.com', "https://x.com; script-src 'unsafe-eval'"],
      resourceDomains: ['https://*.cdn.example.com'],
    });

    expect(csp).toContain('connect-src https://api.example.com');
    expect(csp).toContain(`script-src 'unsafe-inline' https://*.cdn.example.com`);
    expect(csp).not.toContain('unsafe-eval');
  });
});

describe('injectCsp', () => {
  it('puts the policy first inside <head>', () => {
    const html = injectCsp('<html><head><script>1</script></head></html>', "default-src 'none'");

    expect(html).toBe(
      `<html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'"><script>1</script></head></html>`,
    );
  });

  it('prepends the policy to fragments without <head>', () => {
    expect(injectCsp('<div></div>', 'a')).toBe(
      '<meta http-equiv="Content-Security-Policy" content="a"><div></div>',
    );
  });
});

describe('toCallToolResult', () => {
  it('returns the raw MCP result without the LobeHub mcpApp marker', () => {
    const result = toCallToolResult({
      content: 'sunny',
      state: {
        content: [{ text: 'sunny', type: 'text' }],
        mcpApp: { resourceUri: 'ui://app' },
        structuredContent: { temp: 20 },
      } as any,
      success: true,
    });

    expect(result).toEqual({
      content: [{ text: 'sunny', type: 'text' }],
      structuredContent: { temp: 20 },
    });
  });

  it('wraps plain text results and missing results', () => {
    expect(toCallToolResult({ content: 'ok', state: undefined as any, success: true })).toEqual({
      content: [{ text: 'ok', type: 'text' }],
      isError: false,
    });
    expect(toCallToolResult(undefined).isError).toBe(true);
  });
});
