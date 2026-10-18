import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { withEmbeddedCliEnv } from './embeddedCliEnv';

vi.mock('electron', () => ({ app: { getPath: () => '/userData' } }));

const wrapperDir = path.join('/userData', 'bin');
const pathOf = (...dirs: string[]) => dirs.join(path.delimiter);

describe('withEmbeddedCliEnv', () => {
  it('puts the bundled CLI ahead of an older global lh', () => {
    // The app appends its wrapper dir, so a pnpm-global `lh` without `goal` won.
    const env = withEmbeddedCliEnv({ PATH: pathOf('/pnpm', '/usr/bin', wrapperDir) });

    expect(env.PATH).toBe(pathOf(wrapperDir, '/pnpm', '/usr/bin'));
  });

  it('names the bundled wrapper for shells whose profile reorders PATH', () => {
    const env = withEmbeddedCliEnv({ HOME: '/home/u', PATH: '/usr/bin' });

    expect(env.LOBEHUB_CLI).toBe(
      path.join(wrapperDir, process.platform === 'win32' ? 'lh.cmd' : 'lh'),
    );
    expect(env.HOME).toBe('/home/u');
  });

  it('works when the env carries no PATH', () => {
    expect(withEmbeddedCliEnv({}).PATH).toBe(wrapperDir);
  });
});
