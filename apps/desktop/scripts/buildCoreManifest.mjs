import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readRendererTree, signManifest } from './buildRendererManifest.mjs';

const SHA256 = /^[0-9a-f]{64}$/;
const CHANNELS = new Set(['stable', 'beta', 'canary', 'nightly']);
const PLATFORMS = new Set(['darwin', 'win32', 'linux']);

const assertManifest = (manifest) => {
  const problems = [];
  if (!CHANNELS.has(manifest.channel)) problems.push(`channel ${manifest.channel}`);
  if (!PLATFORMS.has(manifest.platform)) problems.push(`platform ${manifest.platform}`);
  if (!manifest.version) problems.push('version');
  if (!Number.isInteger(manifest.seq) || manifest.seq < 0) problems.push(`seq ${manifest.seq}`);
  if (!SHA256.test(manifest.shellAbi)) problems.push(`shellAbi ${manifest.shellAbi}`);
  if (manifest.tree.length === 0) problems.push('tree empty');
  if (manifest.tree.some((file) => !SHA256.test(file.sha256))) problems.push('tree sha256');
  if (problems.length) throw new Error(`core manifest invalid: ${problems.join(', ')}`);
};

export async function buildCoreManifest({
  channel,
  coreDir,
  objectsBaseUrl,
  platform,
  privateKeyPem,
  seq,
  shellAbi,
  version,
}) {
  const tree = readRendererTree(coreDir).tree.filter((file) => file.path !== 'manifest.json');
  const unsigned = {
    applyMode: null,
    channel,
    patches: [],
    platform,
    previous: null,
    rollout: 1,
    schemaVersion: 3,
    seq,
    shellAbi,
    tree,
    version,
    ...(objectsBaseUrl ? { objectsBaseUrl } : {}),
  };
  assertManifest(unsigned);

  let manifest;
  if (privateKeyPem) {
    manifest = signManifest(unsigned, privateKeyPem);
  } else {
    console.warn('buildCoreManifest: no private key, writing unsigned manifest (local dev only)');
    manifest = { ...unsigned, signature: '' };
  }
  writeFileSync(path.join(coreDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = Object.fromEntries(
    process.argv
      .slice(2)
      .filter((arg) => arg.startsWith('--'))
      .map((arg) => arg.slice(2).split(/=(.*)/s).slice(0, 2)),
  );
  const privateKeyPem = args['private-key-file']
    ? readFileSync(args['private-key-file'], 'utf8')
    : process.env.RENDERER_OTA_PRIVATE_KEY;
  const manifest = await buildCoreManifest({
    channel: args.channel,
    coreDir: path.resolve(args.core ?? 'core-dist'),
    objectsBaseUrl: args['objects-base-url'],
    platform: args.platform,
    privateKeyPem,
    seq: Number(args.seq),
    shellAbi: args['shell-abi'],
    version: args.version,
  });
  console.log(
    `core manifest: ${manifest.channel}/${manifest.platform} ${manifest.version} seq ${manifest.seq} (${manifest.tree.length} files, ${manifest.signature ? 'signed' : 'UNSIGNED'})`,
  );
}
