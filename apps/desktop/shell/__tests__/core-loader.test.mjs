import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { canonicalJson, resolveCore } from '../core-loader.js';

const ABI = 'a'.repeat(64);
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const publicKeyPem = publicKey.export({ format: 'pem', type: 'spki' });
const privateKeyPem = privateKey.export({ format: 'pem', type: 'pkcs8' });

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const signManifest = (manifest) => ({
  ...manifest,
  signature: sign(null, Buffer.from(canonicalJson(manifest)), privateKeyPem).toString('base64'),
});

let tmp;
let userData;
let builtinDir;
const otaRoot = () => path.join(userData, 'core-ota');
const readBoot = () => JSON.parse(fs.readFileSync(path.join(otaRoot(), 'boot.json'), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value));
};

const writeCore = (dir, version, { shellAbi = ABI, mutate } = {}) => {
  const files = {
    'dist/main/index.js': `module.exports = ${JSON.stringify(version)};`,
    'dist/preload/index.js': '// preload',
    'dist/renderer/index.html': '<html/>',
  };
  const tree = Object.entries(files).map(([filePath, content]) => {
    fs.mkdirSync(path.join(dir, path.dirname(filePath)), { recursive: true });
    fs.writeFileSync(path.join(dir, filePath), content);
    return { path: filePath, sha256: sha256(content), size: content.length };
  });
  const manifest = signManifest({ shellAbi, tree, version });
  mutate?.(dir, manifest);
  writeJson(path.join(dir, 'manifest.json'), manifest);
};

const writeExternal = (version, opts) =>
  writeCore(path.join(otaRoot(), 'cores', version), version, opts);

const resolve = () => resolveCore({ abi: ABI, builtinDir, publicKey: publicKeyPem, userData });

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'core-loader-'));
  userData = path.join(tmp, 'userData');
  builtinDir = path.join(tmp, 'builtin');
  writeCore(builtinDir, '1.0.0');
});

afterEach(() => fs.rmSync(tmp, { force: true, recursive: true }));

describe('resolveCore', () => {
  it('falls back to builtin when there is no pointer', () => {
    const core = resolve();
    expect(core.source).toBe('builtin');
    expect(core.dir).toBe(builtinDir);
    expect(core.manifest.version).toBe('1.0.0');
  });

  it('returns builtin with null manifest when builtin manifest is missing', () => {
    fs.rmSync(path.join(builtinDir, 'manifest.json'));
    const core = resolve();
    expect(core.source).toBe('builtin');
    expect(core.manifest).toBeNull();
    expect(core.log.join('\n')).toMatch(/builtin/);
  });

  it('loads a valid current core and bumps boot failures', () => {
    writeExternal('1.1.0');
    writeJson(path.join(otaRoot(), 'pointer.json'), { current: '1.1.0' });
    const core = resolve();
    expect(core.source).toBe('external');
    expect(core.dir).toBe(path.join(otaRoot(), 'cores', '1.1.0'));
    expect(core.manifest.version).toBe('1.1.0');
    expect(readBoot()).toEqual({ failures: 1, version: '1.1.0' });
  });

  it('rejects a core whose shellAbi differs', () => {
    writeExternal('1.1.0', { shellAbi: 'b'.repeat(64) });
    writeJson(path.join(otaRoot(), 'pointer.json'), { current: '1.1.0' });
    const core = resolve();
    expect(core.source).toBe('builtin');
    expect(core.log.join('\n')).toMatch(/shellAbi/);
  });

  it('rejects a core with a bad signature', () => {
    writeExternal('1.1.0', { mutate: (_, manifest) => (manifest.version = '9.9.9') });
    writeJson(path.join(otaRoot(), 'pointer.json'), { current: '1.1.0' });
    const core = resolve();
    expect(core.source).toBe('builtin');
    expect(core.log.join('\n')).toMatch(/signature/);
  });

  it('rejects a core whose main file hash mismatches', () => {
    writeExternal('1.1.0', {
      mutate: (dir) => fs.writeFileSync(path.join(dir, 'dist/main/index.js'), 'tampered'),
    });
    writeJson(path.join(otaRoot(), 'pointer.json'), { current: '1.1.0' });
    const core = resolve();
    expect(core.source).toBe('builtin');
    expect(core.log.join('\n')).toMatch(/dist\/main\/index\.js/);
  });

  it('ignores renderer file hashes', () => {
    writeExternal('1.1.0', {
      mutate: (dir) => fs.writeFileSync(path.join(dir, 'dist/renderer/index.html'), 'changed'),
    });
    writeJson(path.join(otaRoot(), 'pointer.json'), { current: '1.1.0' });
    expect(resolve().source).toBe('external');
  });

  it('falls back to previous after 3 boot failures of current', () => {
    writeExternal('1.1.0');
    writeExternal('1.0.5');
    writeJson(path.join(otaRoot(), 'pointer.json'), { current: '1.1.0', previous: '1.0.5' });
    writeJson(path.join(otaRoot(), 'boot.json'), { failures: 3, version: '1.1.0' });
    const core = resolve();
    expect(core.source).toBe('external');
    expect(core.manifest.version).toBe('1.0.5');
    expect(readBoot()).toEqual({ failures: 1, version: '1.0.5' });
  });

  it('rejects version names with path separators', () => {
    writeCore(path.join(tmp, 'evil'), '1.1.0');
    writeJson(path.join(otaRoot(), 'pointer.json'), { current: '../../evil' });
    const core = resolve();
    expect(core.source).toBe('builtin');
    expect(core.log.join('\n')).toMatch(/version/);
  });

  it('markHealthy resets failures for external and is a no-op for builtin', () => {
    writeExternal('1.1.0');
    writeJson(path.join(otaRoot(), 'pointer.json'), { current: '1.1.0' });
    writeJson(path.join(otaRoot(), 'boot.json'), { failures: 2, version: '1.1.0' });
    const core = resolve();
    expect(readBoot()).toEqual({ failures: 3, version: '1.1.0' });
    core.markHealthy();
    expect(readBoot()).toEqual({ failures: 0, version: '1.1.0' });

    expect(() =>
      resolveCore({
        abi: ABI,
        builtinDir,
        publicKey: '',
        userData: path.join(tmp, 'none'),
      }).markHealthy(),
    ).not.toThrow();
  });

  it('never throws on corrupt pointer or missing core dir', () => {
    fs.mkdirSync(otaRoot(), { recursive: true });
    fs.writeFileSync(path.join(otaRoot(), 'pointer.json'), '{not json');
    expect(resolve().source).toBe('builtin');
    writeJson(path.join(otaRoot(), 'pointer.json'), { current: '9.9.9' });
    const core = resolve();
    expect(core.source).toBe('builtin');
    expect(core.log.join('\n')).toMatch(/9\.9\.9/);
  });
});
