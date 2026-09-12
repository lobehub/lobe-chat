import { describe, expect, it } from 'vitest';

import { getDependenciesForModules, getModuleFilesConfig } from './module-deps.config.mjs';

describe('getDependenciesForModules', () => {
  it('keeps every node-pty prebuild without a target platform', () => {
    const deps = getDependenciesForModules(['@lydell/node-pty']);
    expect(deps).toContain('@lydell/node-pty-win32-x64');
    expect(deps).toContain('@lydell/node-pty-darwin-arm64');
  });

  it('drops prebuilds whose package.json os excludes the target platform', () => {
    const deps = getDependenciesForModules(['@lydell/node-pty', 'node-screenshots'], {
      targetPlatform: 'darwin',
    });
    expect(deps).toContain('@lydell/node-pty');
    expect(deps).toContain('@lydell/node-pty-darwin-arm64');
    expect(deps.filter((dep) => /win32|linux/.test(dep))).toEqual([]);
  });

  it('excludes windows debug symbols from packaged files', () => {
    for (const rule of getModuleFilesConfig(['@lydell/node-pty'])) {
      expect(rule.filter).toContain('!**/*.pdb');
    }
  });
});
