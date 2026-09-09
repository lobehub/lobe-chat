import { createHash } from 'node:crypto';
import { glob, mkdir, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const defaultRoot = path.resolve(path.dirname(scriptPath), '../../..');
const collectEnv = 'RENDERER_OTA_COLLECT_INPUTS';
export const MAIN_HASH_PLACEHOLDER = '__LOBEMAINHASH_SOURCE_GRAPH__';
export const MAIN_HASH_ALGORITHM = 'source-v1';

// A workspace with platform-dependent imports can opt into whole-source hashing.
// Keep this list in source control: every build and OTA gate must use the same scope.
// napi-loader is bundled on Linux/Windows but externalized with the macOS addon.
export const wholeSourcePackages = ['packages/napi-loader'];

const excluded = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/release/**',
  '**/prebuilds/**',
  '**/__tests__/**',
  '**/__mocks__/**',
  '**/fixtures/**',
  '**/.git/**',
  '**/resources/bin/**',
  '**/resources/cli-package.json',
  '**/*.test.*',
  '**/*.spec.*',
  '**/*.md',
  '**/*.mdx',
  '**/*.map',
  '**/*.node',
];
const textFile =
  /\.(?:[cm]?[jt]sx?|json|ya?ml|gypi?|mm?|cc|cpp|c|h|hpp|swift|html|css|svg|sh|txt)$/i;
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const slash = (value) => value.replaceAll('\\', '/');
const inside = (root, file) => {
  const relative = path.relative(root, file);
  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
  );
};
const stableJson = (value) =>
  JSON.stringify(value, (_, item) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : item,
  );

export function createInputManifest(inputs) {
  const sorted = [...inputs].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  if (new Set(sorted.map((input) => input.path)).size !== sorted.length) {
    throw new Error('Duplicate main hash input path');
  }
  return {
    algorithm: MAIN_HASH_ALGORITHM,
    inputs: sorted,
    mainHash: sha256(stableJson({ algorithm: MAIN_HASH_ALGORITHM, inputs: sorted })),
  };
}

/** Uses the transformed module graph, never generated bundle bytes or installed package versions. */
export async function collectViteGraph(options) {
  const { build } = await import('vite');
  const files = new Set();
  const configFiles = new Set();
  let defines;
  await build({
    ...options,
    build: { ...options.build, minify: false, sourcemap: false, write: false },
    logLevel: 'silent',
    plugins: [
      ...(options.plugins ?? []),
      {
        name: 'renderer-ota-source-inputs',
        configResolved(config) {
          for (const file of config.configFileDependencies) configFiles.add(file);
          defines = config.define;
        },
        buildEnd(error) {
          if (error) return;
          for (const id of this.getModuleIds()) {
            if (!this.getModuleInfo(id)?.isExternal) files.add(id);
          }
        },
      },
    ],
  });
  return { configFiles: [...configFiles], defines, files: [...files] };
}

export async function collectSourceInputs({
  repoRoot = defaultRoot,
  cloudRoot,
  graph = [],
  sourcePackages = wholeSourcePackages,
  publicKey = process.env.RENDERER_OTA_PUBLIC_KEY ?? '',
} = {}) {
  repoRoot = await realpath(repoRoot);
  if (cloudRoot) cloudRoot = await realpath(cloudRoot);
  const inputs = new Map();
  const addValue = (name, value, group) =>
    inputs.set(name, { group, path: name, sha256: sha256(value) });
  const roots = [['oss', repoRoot], ...(cloudRoot ? [['cloud', cloudRoot]] : [])];

  const addFile = async (file, group) => {
    // Queries identify Vite transforms, not a different source file.
    if (file.startsWith('\0')) return;
    file = file.split('?')[0];
    if (!path.isAbsolute(file)) return;
    file = await realpath(file);
    if (slash(file).includes('/node_modules/')) return;
    const owner = roots.find(([, root]) => inside(root, file));
    if (!owner) throw new Error(`Main hash input is outside the source roots: ${file}`);
    if (!(await stat(file)).isFile()) return;
    const [prefix, root] = owner;
    const name = `${prefix}/${slash(path.relative(root, file))}`;
    const bytes = await readFile(file);
    // JSON key order affects exports conditions and runtime iteration; preserve source order.
    const content = textFile.test(file) ? bytes.toString('utf8').replaceAll('\r\n', '\n') : bytes;
    addValue(name, content, group);
  };
  const addTree = async (root, relative, group) => {
    const dir = path.resolve(root, relative);
    if (!inside(root, dir)) throw new Error(`Invalid source directory: ${relative}`);
    await stat(dir); // Missing declared inputs must not silently produce a compatible hash.
    for await (const file of glob(`${slash(relative)}/**/*`, { cwd: root, exclude: excluded })) {
      await addFile(path.join(root, file), group);
    }
  };

  for (const [index, target] of graph.entries()) {
    for (const file of target.files) {
      await addFile(file, 'workspace');
      // Package exports/sideEffects can change the graph without changing its source files.
      if (!path.isAbsolute(file) || slash(file).includes('/node_modules/')) continue;
      let dir = path.dirname(await realpath(file.split('?')[0]));
      const owner = roots.find(([, root]) => inside(root, dir));
      while (owner && dir !== owner[1]) {
        const manifest = path.join(dir, 'package.json');
        try {
          await addFile(manifest, 'config');
          break;
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
        }
        dir = path.dirname(dir);
      }
    }
    for (const file of target.configFiles) await addFile(file, 'config');
    // Values are hashed, not stored: defines may contain deployment configuration.
    addValue(
      `$defines/${index === 0 ? 'main' : 'preload'}`,
      stableJson(target.defines ?? {}),
      'config',
    );
  }
  for (const relative of sourcePackages) await addTree(repoRoot, relative, 'workspace');
  for (const relative of ['src/main', 'src/preload', 'src/common', 'resources']) {
    await addTree(repoRoot, `apps/desktop/${relative}`, 'desktop');
  }
  for (const [prefix, root] of roots) {
    for await (const binding of glob('packages/*/binding.gyp', { cwd: root })) {
      await addTree(root, path.dirname(binding), 'native');
    }
    // Cloud's plugin helpers are loaded at config time, outside the application graph.
    if (prefix === 'cloud') {
      await addTree(root, 'scripts/cloud-desktop', 'config');
      // Overlay runtime/build dependencies (e.g. Sentry) are declared outside Desktop.
      const { dependencies, devDependencies, optionalDependencies } = JSON.parse(
        await readFile(path.join(root, 'package.json'), 'utf8'),
      );
      addValue(
        '$cloud-dependencies',
        stableJson({ dependencies, devDependencies, optionalDependencies }),
        'dependencies',
      );
    }
  }
  for (const file of [
    'apps/desktop/package.json',
    'apps/desktop/pnpm-lock.yaml',
    'apps/desktop/pnpm-workspace.yaml',
    'apps/desktop/vite.main.config.ts',
    'apps/desktop/vite.preload.config.ts',
    'apps/desktop/vite.shared.ts',
    'apps/desktop/tsconfig.json',
    'apps/desktop/native-deps.config.mjs',
    'apps/desktop/external-runtime-deps.config.mjs',
    'apps/desktop/module-deps.config.mjs',
    'apps/desktop/scripts/mainHash.mjs',
  ]) {
    await addFile(
      path.join(repoRoot, file),
      file.endsWith('pnpm-lock.yaml') ? 'dependencies' : 'config',
    );
  }
  await addTree(repoRoot, 'plugins/vite', 'config');
  addValue('$public-key', publicKey.replaceAll('\r\n', '\n').trim(), 'metadata');
  return createInputManifest(inputs.values());
}

export async function computeMainHash() {
  const desktopRoot = path.join(defaultRoot, 'apps/desktop');
  const previous = process.env[collectEnv];
  process.env[collectEnv] = '1';
  // Vite config messages must not contaminate the CLI hash on stdout.
  const originalInfo = console.info;
  const originalLog = console.log;
  console.log = (...args) => console.error(...args);
  console.info = (...args) => console.error(...args);
  let manifest;
  try {
    const graph = [];
    for (const target of ['main', 'preload']) {
      graph.push(
        await collectViteGraph({
          configFile: path.join(desktopRoot, `vite.${target}.config.ts`),
          mode: 'production',
        }),
      );
    }
    manifest = await collectSourceInputs({
      cloudRoot: process.env.CLOUD_DESKTOP === '1' ? path.dirname(defaultRoot) : undefined,
      graph,
    });
  } finally {
    console.info = originalInfo;
    console.log = originalLog;
    if (previous === undefined) delete process.env[collectEnv];
    else process.env[collectEnv] = previous;
  }
  const releaseDir = path.join(desktopRoot, 'release');
  await mkdir(releaseDir, { recursive: true });
  await writeFile(
    path.join(releaseDir, 'renderer-mainhash-inputs.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest.mainHash;
}

export async function resolveMainHash() {
  if (process.env[collectEnv] === '1') return MAIN_HASH_PLACEHOLDER;
  if (!process.env.MAIN_HASH) return computeMainHash();
  if (!/^[0-9a-f]{64}$/.test(process.env.MAIN_HASH)) {
    throw new Error('MAIN_HASH must be a 64-character lowercase SHA-256');
  }
  return process.env.MAIN_HASH;
}

export const rendererMainHashArtifact = (mainHash) => ({
  name: 'renderer-main-hash-artifact',
  async writeBundle() {
    const releaseDir = path.join(defaultRoot, 'apps/desktop/release');
    await mkdir(releaseDir, { recursive: true });
    await writeFile(path.join(releaseDir, 'renderer-mainhash.txt'), `${mainHash}\n`);
  },
});

if (
  process.env[collectEnv] !== '1' &&
  process.argv[1] &&
  path.resolve(process.argv[1]) === scriptPath
) {
  computeMainHash().then(
    (hash) => console.log(hash),
    (error) => {
      console.error(error);
      process.exitCode = 1;
    },
  );
}
