const { createHash, verify } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const MAX_BOOT_FAILURES = 3;
const VERSION_NAME = /^[\w.-]+$/;
const VERIFIED_PREFIX = /^dist\/(?:main|preload)\//;
const MAIN_ENTRY = 'dist/main/index.js';

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const canonicalJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
};

const verifyManifestSignature = (manifest, publicKeyPem) => {
  const { signature, ...unsigned } = manifest;
  try {
    return verify(
      null,
      Buffer.from(canonicalJson(unsigned)),
      publicKeyPem,
      Buffer.from(signature, 'base64'),
    );
  } catch {
    return false;
  }
};

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return undefined;
  }
};

const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value));

const verifyCandidate = (dir, version, { abi, boot, publicKey }) => {
  const manifest = readJson(path.join(dir, 'manifest.json'));
  if (!manifest) throw new Error('manifest missing or unreadable');
  if (!verifyManifestSignature(manifest, publicKey)) throw new Error('bad signature');
  if (manifest.shellAbi !== abi) throw new Error(`shellAbi ${manifest.shellAbi} != ${abi}`);
  if (boot.version === version && boot.failures >= MAX_BOOT_FAILURES)
    throw new Error(`boot failed ${boot.failures}x`);
  const files = manifest.tree.filter((entry) => VERIFIED_PREFIX.test(entry.path));
  if (!files.some((entry) => entry.path === MAIN_ENTRY))
    throw new Error(`${MAIN_ENTRY} not in tree`);
  for (const file of files) {
    if (sha256(fs.readFileSync(path.join(dir, file.path))) !== file.sha256)
      throw new Error(`hash mismatch ${file.path}`);
  }
  return manifest;
};

function resolveCore({ userData, builtinDir, abi, publicKey }) {
  const otaRoot = path.join(userData, 'core-ota');
  const bootFile = path.join(otaRoot, 'boot.json');
  const pointer = readJson(path.join(otaRoot, 'pointer.json')) ?? {};
  const boot = readJson(bootFile) ?? {};
  const log = [];

  for (const version of [pointer.current, pointer.previous]) {
    if (!version) continue;
    if (typeof version !== 'string' || !VERSION_NAME.test(version) || /^\.\.?$/.test(version)) {
      log.push(`invalid core version name ${JSON.stringify(version)}`);
      continue;
    }
    const dir = path.join(otaRoot, 'cores', version);
    try {
      const manifest = verifyCandidate(dir, version, { abi, boot, publicKey });
      const failures = boot.version === version ? Number(boot.failures) || 0 : 0;
      writeJson(bootFile, { failures: failures + 1, version });
      const markHealthy = () => {
        try {
          writeJson(bootFile, { failures: 0, version });
        } catch (error) {
          log.push(`markHealthy failed: ${error.message}`);
        }
      };
      return { dir, log, manifest, markHealthy, source: 'external' };
    } catch (error) {
      log.push(`core ${version} rejected: ${error.message}`);
    }
  }

  const manifest = readJson(path.join(builtinDir, 'manifest.json')) ?? null;
  if (!manifest) log.push(`builtin manifest missing at ${builtinDir}`);
  return { dir: builtinDir, log, manifest, markHealthy() {}, source: 'builtin' };
}

module.exports = { canonicalJson, resolveCore, verifyManifestSignature };
