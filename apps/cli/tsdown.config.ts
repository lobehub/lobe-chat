import { defineConfig, type UserConfig } from 'tsdown';

export const cliConfig: UserConfig = {
  banner: { js: '#!/usr/bin/env node' },
  clean: true,
  deps: {
    // The desktop app executes this bundle directly from Resources/bin, where
    // the published package's node_modules tree does not exist. Keep the only
    // production dependency inside the bundle so the embedded CLI is truly
    // self-contained instead of failing at startup with ERR_MODULE_NOT_FOUND.
    alwaysBundle: ['ws'],
    // `@lydell/node-pty` is deliberately NOT bundled: it loads a prebuilt
    // native binary per platform, which bundling would break. It stays a real
    // runtime dependency and is imported lazily (see `src/device/terminal.ts`),
    // so only a process that actually opens a remote terminal resolves it —
    // the desktop-embedded CLI keeps working without it.
    neverBundle: ['@lydell/node-pty'],
  },
  entry: ['src/index.ts'],
  fixedExtension: false,
  format: ['esm'],
  inputOptions(options) {
    // Rolldown downgrades an unresolvable import to an external dependency and
    // still reports a successful build, so a workspace package that fails to
    // resolve (a broken `node_modules` link, a renamed package) silently ships
    // a bundle that dies at startup with ERR_MODULE_NOT_FOUND. Nothing the CLI
    // imports is expected to be external, so treat it as a build failure.
    options.onLog = (level, log, defaultHandler) => {
      if (log.code === 'UNRESOLVED_IMPORT') {
        throw new Error(
          `Unresolved import in the CLI bundle: ${log.message}. The embedded CLI has no node_modules at runtime, so every import must be bundled.`,
        );
      }

      defaultHandler(level, log);
    };

    return options;
  },
  minify: !!process.env.MINIFY,
  outputOptions: {
    codeSplitting: false,
  },
  platform: 'node',
  // Matches the `engines.node` floor: reading a compressed trace snapshot needs
  // `node:zlib` zstd, which lands in 22.15. Node 20 went EOL in April 2026.
  target: 'node22',
};

/**
 * The DeepSeek Harness runtime runs in its own Node child process, launched by
 * `spawnDshSdkSession` from a sibling `dshRuntimeEntry.js` next to the CLI
 * bundle. The CLI bundle is a single file without code splitting, so that
 * entry has to be emitted explicitly or every packaged `lh hetero` DSH run dies
 * at spawn with a missing-module error.
 *
 * The harness packages stay external: the runtime loads its plugins by name
 * from its YAML composition (no static import the bundler could follow), and
 * `dsh-subprocess-local` pulls in the native `node-pty` addon, so they resolve
 * from `node_modules` at runtime exactly as they do for the desktop app.
 */
export const dshRuntimeConfig: UserConfig = {
  clean: false,
  deps: { neverBundle: [/^@deepseek-ai\//, 'node-pty'] },
  entry: {
    dshRuntimeEntry: '../../packages/heterogeneous-agents/src/spawn/dshRuntimeEntry.ts',
  },
  fixedExtension: false,
  format: ['esm'],
  minify: !!process.env.MINIFY,
  platform: 'node',
  target: 'node22',
};

export default defineConfig([cliConfig, dshRuntimeConfig]);
