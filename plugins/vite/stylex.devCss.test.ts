import type { Plugin } from 'vite';
import { describe, expect, it } from 'vitest';

import { stylexPlugin, stylexProxiedDevCssModuleId } from './stylex';

const devCssPlugin = () => {
  const plugins = stylexPlugin() as Plugin[];
  const plugin = plugins.find((item) => item.name === 'lobe-stylex-dev-css');
  if (!plugin?.resolveId || !plugin.load) throw new Error('missing stylex dev css plugin');
  return plugin;
};

describe('stylexProxiedDevCssPlugin', () => {
  it('fetches dev CSS from the module URL origin', () => {
    const plugin = devCssPlugin();
    const resolved = plugin.resolveId.call(undefined, stylexProxiedDevCssModuleId, undefined, {
      attributes: {},
      isEntry: true,
    });
    const code = plugin.load.call(undefined, String(resolved));

    expect(code).toContain('import.meta.url');
    expect(code).toContain("'/virtual' + ':stylex.css'");
    expect(code).not.toContain("new URL('/virtual:stylex.css'");
    expect(code).not.toContain("fetch('/virtual:stylex.css");
    expect(code).toContain("type.includes('text/css')");
  });
});
