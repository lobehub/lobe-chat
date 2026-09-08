import { describe, expect, it } from 'vitest';

import { assertNoElectronBuildInputs, findElectronBuildInputs } from './microAppBuildInputs';

describe('findElectronBuildInputs', () => {
  it('reports Electron-layer files sorted', () => {
    expect(
      findElectronBuildInputs([
        'src/features/Electron/TabHost/index.ts',
        'lobehub/src/services/electron/git.ts',
      ]),
    ).toEqual(['lobehub/src/services/electron/git.ts', 'src/features/Electron/TabHost/index.ts']);
  });

  it('passes files outside the Electron layer', () => {
    expect(
      findElectronBuildInputs([
        'src/features/HeterogeneousAgent/StatusGuide/index.tsx',
        'src/services/git.ts',
        'packages/builtin-tool-local-system/src/systemRole.desktop.ts',
      ]),
    ).toEqual([]);
  });
});

describe('assertNoElectronBuildInputs', () => {
  it('throws naming the app and every offender', () => {
    expect(() =>
      assertNoElectronBuildInputs('share', [
        'src/features/Electron/TabHost/index.ts',
        'lobehub/src/services/electron/git.ts',
        'src/services/git.ts',
      ]),
    ).toThrow(
      /\[share\] 2 Electron-layer module\(s\).*lobehub\/src\/services\/electron\/git\.ts.*src\/features\/Electron\/TabHost\/index\.ts/s,
    );
  });

  it('does not throw for a clean graph', () => {
    expect(() =>
      assertNoElectronBuildInputs('share', [
        'src/services/git.ts',
        'plugins/vite/electronStubs/index.ts',
      ]),
    ).not.toThrow();
  });
});
