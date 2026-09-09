import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { collectSourceInputs, collectViteGraph } from '../mainHash.mjs';
import {
  diffInputs,
  validateInputManifest,
  validateReleaseInputs,
  validateRendererBase,
} from '../validateMainHash.mjs';

let root;
const put = async (file, content = '') => {
  const target = path.join(root, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
  return target;
};
const hash = (options = {}) =>
  collectSourceInputs({ repoRoot: root, publicKey: 'test-key', sourcePackages: [], ...options });

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'main hash '));
  await put('apps/desktop/package.json', JSON.stringify({ version: '1.0.0' }));
  await put('apps/desktop/pnpm-lock.yaml', 'lockfileVersion: 9\n');
  await put('apps/desktop/pnpm-workspace.yaml', 'packages: []\n');
  await put('apps/desktop/tsconfig.json', '{}');
  for (const file of [
    'vite.main.config.ts',
    'vite.preload.config.ts',
    'vite.shared.ts',
    'native-deps.config.mjs',
    'external-runtime-deps.config.mjs',
    'module-deps.config.mjs',
    'scripts/mainHash.mjs',
  ])
    await put(`apps/desktop/${file}`, 'export {};\n');
  for (const dir of ['main', 'preload', 'common'])
    await put(`apps/desktop/src/${dir}/index.ts`, 'export {};\n');
  await put('apps/desktop/resources/error.html', '<html>error</html>\n');
  await put('plugins/vite/platform.ts', 'export {};\n');
  await put('packages/native/binding.gyp', '{}');
  await put('packages/native/native/addon.mm', '// native v1\n');
});

afterEach(async () => {
  await rm(root, { force: true, recursive: true });
});

describe('source main hash', () => {
  it.each([
    ['apps/desktop/src/main/index.ts', 'export const changed = true;'],
    ['apps/desktop/src/preload/index.ts', 'export const changed = true;'],
    ['apps/desktop/src/common/index.ts', 'export const changed = true;'],
    ['apps/desktop/src/main/capture.windows.ts', 'export const capture = true;'],
    ['packages/native/native/addon.mm', '// native v2'],
    ['packages/native/binding.gyp', '{"targets":[]}'],
    ['apps/desktop/pnpm-lock.yaml', 'lockfileVersion: 9\npackages: {changed: true}\n'],
    ['apps/desktop/package.json', '{"version":"1.0.1"}'],
    ['apps/desktop/vite.shared.ts', 'export const target = "node24";'],
    ['apps/desktop/resources/error.html', '<html>new error</html>'],
  ])('invalidates all platforms for %s', async (file, content) => {
    const before = await hash();
    await put(file, content);
    const after = await hash();
    expect(after.mainHash).not.toBe(before.mainHash);
    expect(diffInputs(before, after).some((line) => line.startsWith(`oss/${file}:`))).toBe(true);
    expect(() => validateInputManifest(after)).not.toThrow();
  });

  it('ignores installed native variants, generated output, renderer, docs and tests', async () => {
    const before = await hash();
    for (const file of [
      'apps/desktop/node_modules/native-darwin/package.json',
      'apps/desktop/node_modules/native-linux/package.json',
      'apps/desktop/dist/main/index.js',
      'apps/desktop/src/overlay/entry.tsx',
      'apps/desktop/src/main/__tests__/foo.test.ts',
      'apps/desktop/src/main/README.md',
      'apps/desktop/resources/bin/lobe-cli.js',
      'apps/desktop/resources/cli-package.json',
      'packages/native/build/Release/addon.node',
      'packages/native/dist/index.js',
    ])
      await put(file, '{}');
    expect((await hash()).mainHash).toBe(before.mainHash);
  });

  it('normalizes text line endings, but preserves JSON key order and binary resource bytes', async () => {
    await put('apps/desktop/package.json', '{"version":"1.0.0","name":"desktop"}\n');
    const before = await hash();
    await put('apps/desktop/package.json', '{"version":"1.0.0","name":"desktop"}\r\n');
    await put('apps/desktop/src/main/index.ts', 'export {};\r\n');
    expect((await hash()).mainHash).toBe(before.mainHash);
    await put('apps/desktop/package.json', '{"name":"desktop","version":"1.0.0"}\n');
    expect((await hash()).mainHash).not.toBe(before.mainHash);
    await put('apps/desktop/resources/icon.png', Buffer.from([0, 13, 10, 255]));
    const withBinary = await hash();
    await put('apps/desktop/resources/icon.png', Buffer.from([0, 10, 255]));
    expect((await hash()).mainHash).not.toBe(withBinary.mainHash);
  });

  it('is independent of checkout location and symlinked roots', async () => {
    const copy = `${root}-copy`;
    const link = `${root}-link`;
    try {
      await cp(root, copy, { recursive: true });
      await symlink(copy, link, process.platform === 'win32' ? 'junction' : 'dir');
      expect((await hash({ repoRoot: copy })).mainHash).toBe((await hash()).mainHash);
      expect((await hash({ repoRoot: link })).mainHash).toBe((await hash()).mainHash);
    } finally {
      await rm(link, { force: true });
      await rm(copy, { recursive: true, force: true });
    }
  });

  it('tracks Cloud runtime sources and dependency declarations without the whole Cloud revision', async () => {
    const cloud = `${root}-cloud`;
    try {
      await mkdir(path.join(cloud, 'scripts/cloud-desktop'), { recursive: true });
      await writeFile(path.join(cloud, 'package.json'), '{"dependencies":{"sentry":"1.0.0"}}');
      const source = path.join(cloud, 'runtime.ts');
      await writeFile(source, 'export const value = 1;');
      const options = {
        cloudRoot: cloud,
        graph: [{ files: [source], configFiles: [], defines: {} }],
      };
      const before = await hash(options);
      await writeFile(path.join(cloud, 'renderer.ts'), 'renderer-only change');
      expect((await hash(options)).mainHash).toBe(before.mainHash);
      await writeFile(source, 'export const value = 2;');
      const changed = await hash(options);
      expect(changed.mainHash).not.toBe(before.mainHash);
      await writeFile(path.join(cloud, 'package.json'), '{"dependencies":{"sentry":"2.0.0"}}');
      expect((await hash(options)).mainHash).not.toBe(changed.mainHash);
    } finally {
      await rm(cloud, { force: true, recursive: true });
    }
  });

  it('does not hide deleted sources, missing locks or changed keys', async () => {
    const before = await hash();
    expect((await hash({ publicKey: 'another-key' })).mainHash).not.toBe(before.mainHash);
    await rm(path.join(root, 'packages/native/native/addon.mm'));
    expect((await hash()).mainHash).not.toBe(before.mainHash);
    await rm(path.join(root, 'apps/desktop/pnpm-lock.yaml'));
    await expect(hash()).rejects.toThrow();
  });
});

describe('workspace Vite graph', () => {
  const collect = async () =>
    collectViteGraph({
      configFile: false,
      root,
      build: {
        lib: { entry: path.join(root, 'apps/desktop/src/main/index.ts'), formats: ['es'] },
        ssr: true,
      },
      resolve: { alias: { '@workspace': path.join(root, 'packages/shared/src') } },
    });

  it('follows runtime, side-effect and dynamic imports but not type-only or unused files', async () => {
    await put('packages/shared/src/runtime.ts', 'export const value = 1;');
    await put('packages/shared/src/types.ts', 'export interface Value { value: number }');
    await put('packages/shared/src/unused.ts', 'export const unused = 1;');
    await put('packages/shared/src/effect.ts', 'globalThis.effect = true;');
    await put('packages/shared/src/lazy.ts', 'export const lazy = 1;');
    await put('packages/shared/src/data.json', '{"label":"v1"}');
    await put(
      'apps/desktop/src/main/index.ts',
      `
      import type { Value } from '@workspace/types';
      import { value } from '@workspace/runtime';
      import '@workspace/effect';
      import data from '@workspace/data.json';
      export const result: Value = { value };
      export const label = data.label;
      export const load = () => import('@workspace/lazy');
    `,
    );
    await put('packages/shared/package.json', '{"type":"module"}');
    const graph = await collect();
    const before = await hash({ graph: [graph] });
    const paths = before.inputs.map((input) => input.path);
    expect(paths).toContain('oss/packages/shared/src/runtime.ts');
    expect(paths).toContain('oss/packages/shared/src/effect.ts');
    expect(paths).toContain('oss/packages/shared/src/lazy.ts');
    expect(paths).toContain('oss/packages/shared/src/data.json');
    expect(paths).not.toContain('oss/packages/shared/src/types.ts');
    expect(paths).not.toContain('oss/packages/shared/src/unused.ts');
    await put('packages/shared/src/types.ts', 'export interface Value { other: string }');
    await put('packages/shared/src/unused.ts', 'export const unused = 2;');
    expect((await hash({ graph: [await collect()] })).mainHash).toBe(before.mainHash);
    await put('packages/shared/package.json', '{"type":"module","sideEffects":false}');
    expect((await hash({ graph: [await collect()] })).mainHash).not.toBe(before.mainHash);
    await put('packages/shared/package.json', '{"type":"module"}');
    await put('packages/shared/src/runtime.ts', 'export const value = 2;');
    expect((await hash({ graph: [await collect()] })).mainHash).not.toBe(before.mainHash);
  });

  it('uses relative real source paths and whole-source fallback for differing workspace graphs', async () => {
    await put('packages/shared/src/mac.ts', 'export const value = "mac";');
    const win = await put('packages/shared/src/windows.ts', 'export const value = "windows";');
    const link = path.join(root, 'linked-shared');
    await symlink(
      path.join(root, 'packages/shared'),
      link,
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    const macGraph = [{ files: [path.join(link, 'src/mac.ts')], configFiles: [], defines: {} }];
    const winGraph = [{ files: [win], configFiles: [], defines: {} }];
    const before = await hash({ graph: macGraph });
    expect(before.inputs.find((input) => input.path.endsWith('/mac.ts')).path).toBe(
      'oss/packages/shared/src/mac.ts',
    );
    const other = await hash({ graph: winGraph });
    expect(other.mainHash).not.toBe(before.mainHash);
    expect(diffInputs(before, other).join('\n')).toContain('(missing)');
    const fallback = { sourcePackages: ['packages/shared'] };
    expect((await hash({ ...fallback, graph: macGraph })).mainHash).toBe(
      (await hash({ ...fallback, graph: winGraph })).mainHash,
    );
  });
});

describe('release hash validation', () => {
  it('requires r0, the source manifest and the packaged hash to agree', async () => {
    const inputs = await hash();
    const release = path.join(root, 'release');
    await put('release/renderer-mainhash-inputs.json', JSON.stringify(inputs));
    await put('release/renderer-mainhash.txt', inputs.mainHash);
    const feed = 'release/renderer-ota/canary/1.0.0/renderer/v2';
    const pack = `packs/${'a'.repeat(64)}.zip`;
    const r0 = {
      appVersion: '1.0.0',
      version: 'r0',
      schemaVersion: 2,
      mainHash: inputs.mainHash,
      full: { path: pack },
    };
    await put(`${feed}/latest.json`, JSON.stringify(r0));
    await put(`${feed}/versions/r0.json`, JSON.stringify(r0));
    await put(`${feed}/${pack}`, 'pack');
    await expect(validateRendererBase(release, 'canary', '1.0.0')).resolves.toMatchObject({
      mainHash: inputs.mainHash,
    });
    await put(`${feed}/latest.json`, JSON.stringify({ ...r0, mainHash: 'b'.repeat(64) }));
    await expect(validateRendererBase(release, 'canary', '1.0.0')).rejects.toThrow(
      'does not match',
    );
    await put(`${feed}/latest.json`, JSON.stringify(r0));
    await rm(path.join(root, feed, pack));
    await expect(validateRendererBase(release, 'canary', '1.0.0')).rejects.toThrow();
  });

  it('blocks missing platforms and changed contents before writing a canonical base', async () => {
    const before = await hash();
    const release = path.join(root, 'release');
    await put('release/renderer-mainhash/mac.json', JSON.stringify(before));
    await expect(validateReleaseInputs(release, ['mac', 'linux'])).rejects.toThrow('expected');
    await put('apps/desktop/src/main/index.ts', 'export const changed = true;');
    const after = await hash();
    await put('release/renderer-mainhash/linux.json', JSON.stringify(after));
    await expect(validateReleaseInputs(release, ['mac', 'linux'])).rejects.toThrow(
      'oss/apps/desktop/src/main/index.ts',
    );
    await expect(readFile(path.join(release, 'renderer-mainhash.txt'))).rejects.toThrow();
    await put('release/renderer-mainhash/linux.json', JSON.stringify(before));
    await validateReleaseInputs(release, ['mac', 'linux']);
    expect((await readFile(path.join(release, 'renderer-mainhash.txt'), 'utf8')).trim()).toBe(
      before.mainHash,
    );
    expect(() => validateInputManifest({ ...before, mainHash: after.mainHash })).toThrow(
      'does not match',
    );
    expect(() => validateInputManifest({ ...before, algorithm: 'old-bundle' })).toThrow(
      'full release required',
    );
  });
});
