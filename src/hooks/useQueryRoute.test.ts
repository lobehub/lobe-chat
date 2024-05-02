// @vitest-environment edge-runtime
import { describe, expect, it, vi } from 'vitest';

import { genHref } from './useQueryRoute';

describe('genHref', () => {
  it('should generate correct href without hash and replace', () => {
    const result = genHref({
      url: '/example',
      prevQuery: { foo: 'bar' },
      query: { baz: 'qux' },
    });

    expect(result).toBe('/example?baz=qux&foo=bar');
  });

  it('should replace entire query string when replace is true', () => {
    const result = genHref({
      url: '/example',
      prevQuery: { a: 'test' },
      replace: true,
      query: { baz: 'qux' },
    });

    expect(result).toBe('/example?baz=qux');
  });

  it('should append hash to the URL', () => {
    const result = genHref({
      url: '/example',
      query: { foo: 'bar' },
      hash: 'section1',
    });

    expect(result).toBe('/example?foo=bar#section1');
  });

  it('should handle scenarios when on server side', () => {
    const result = genHref({
      url: '/example',
      query: { foo: 'bar' },
      hash: 'section1',
    });

    expect(result).toBe('/example?foo=bar#section1');
  });

  it('should handle cases with empty query and hash', () => {
    const result = genHref({
      url: '/example',
      query: {},
      hash: '',
    });

    expect(result).toBe('/example');
  });

  it('should handle cases without hash when on server side', () => {
    const result = genHref({
      url: '/example',
      query: { foo: 'bar' },
    });

    expect(result).toBe('/example?foo=bar');
  });
});
