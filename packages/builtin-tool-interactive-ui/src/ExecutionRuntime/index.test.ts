import { describe, expect, it } from 'vitest';

import { InteractiveUIExecutionRuntime } from './index';

const source = {
  css: '',
  fallback: 'A: 60, B: 50, C: 65 at quantity 500.',
  html: '<p>Compare plans</p>',
  js: 'throw new Error("never execute on server")',
  title: 'Plans',
  version: 1,
};

describe('InteractiveUIExecutionRuntime', () => {
  it('validates and returns result metadata without executing or duplicating source', async () => {
    const result = await new InteractiveUIExecutionRuntime().renderUI(source);
    expect(result.success).toBe(true);
    expect(result.state).toEqual({ status: 'ready', version: 1 });
    expect(result.content).toContain(source.fallback);
    expect(result.content).not.toContain(source.js);
  });

  it.each([null, {}, { ...source, version: 2 }, { ...source, js: 'x'.repeat(32_001) }])(
    'rejects invalid artifacts with a recoverable text result',
    async (args) => {
      const result = await new InteractiveUIExecutionRuntime().renderUI(args);
      expect(result.success).toBe(false);
      expect(result.error.type).toBe('InvalidInteractiveUI');
      expect(result.content).toContain('plain text');
      expect(result.state).toBeUndefined();
    },
  );
});
