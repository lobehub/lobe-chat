import { describe, expect, it } from 'vitest';

import { DSH_RUNTIME_CONFIG } from '../../packages/heterogeneous-agents/src/spawn/dshRuntimeConfig';
import { externalRuntimeModules } from './external-runtime-deps.config.mjs';

describe('external runtime modules', () => {
  it('ships every plugin the bundled DSH runtime loads by name', () => {
    const pluginNames = [...DSH_RUNTIME_CONFIG.matchAll(/^\s+name: '([^']+)'$/gm)].map(
      ([, name]) => name,
    );

    expect(pluginNames.length).toBeGreaterThan(0);
    expect(externalRuntimeModules).toEqual(expect.arrayContaining(pluginNames));
  });
});
