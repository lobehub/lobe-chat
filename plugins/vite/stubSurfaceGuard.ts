import { readFileSync } from 'node:fs';
import path from 'node:path';

import { type Plugin } from 'vite';

import { reportStubSurfaceGaps } from './stubSurface';

export interface StubSurfaceGuardOptions {
  appName: string;
  env: 'client' | 'ssr';
  repoRoot: string;
  skipPrefixes: string[];
  stubs: Record<string, string>;
}

export const stubSurfaceGuard = ({
  appName,
  env,
  repoRoot,
  skipPrefixes,
  stubs,
}: StubSurfaceGuardOptions): Plugin => ({
  apply: 'build',
  applyToEnvironment: (environment) => environment.name === env,
  buildEnd() {
    const stubEntries = Object.entries(stubs).map(([specifier, file]) => ({
      source: readFileSync(file, 'utf8'),
      specifier,
    }));
    const files: Array<{ rel: string; source: string }> = [];
    for (const id of this.getModuleIds()) {
      if (!id.startsWith(repoRoot) || id.includes('/node_modules/') || id.includes('\0')) continue;
      const file = id.split('?')[0]!;
      if (!/\.[cm]?[jt]sx?$/.test(file)) continue;
      const rel = path.relative(repoRoot, file);
      if (skipPrefixes.some((prefix) => rel.startsWith(prefix))) continue;
      let source: string;
      try {
        source = readFileSync(file, 'utf8');
      } catch {
        continue;
      }
      files.push({ rel, source });
    }
    const lines = reportStubSurfaceGaps(files, stubEntries);
    if (lines.length > 0) {
      this.error(
        `${appName} ${env} stub is missing APIs used by the module graph:\n${lines.join('\n')}\n` +
          `Add the export/member to the matching stub module (empty state or reject), ` +
          `or keep the importer off this graph.`,
      );
    }
  },
  name: `${appName}-${env}-stub-surface-guard`,
});
