import { Lang, parse } from '@ast-grep/napi';
import fs from 'fs-extra';
import path from 'node:path';

import { isDirectRun, runStandalone } from './utils.mjs';

export const modifyRoutes = async (TEMP_DIR: string) => {
  // 1. Delete routes
  const filesToDelete = [
    // Backend API routes
    'src/app/(backend)/api',
    'src/app/(backend)/webapi',
    'src/app/(backend)/trpc',
    'src/app/(backend)/oidc',
    'src/app/(backend)/middleware',
    'src/app/(backend)/f',
    'src/app/(backend)/market',

    // Auth & User routes
    'src/app/[variants]/(auth)',
    'src/app/[variants]/(main)/(mobile)/me',
    'src/app/[variants]/(main)/changelog',
    'src/app/[variants]/oauth',

    // Desktop specific (to be cleaned up or checked)
    'src/app/desktop/devtools',
    'src/app/desktop/layout',

    // Other app roots
    'src/app/market-auth-callback',
    'src/app/manifest.ts',
    'src/app/robots.tsx',
    'src/app/sitemap.tsx',
    'src/app/sw.ts',

    // Config files
    'src/instrumentation.ts',
    'src/instrumentation.node.ts',
  ];

  for (const file of filesToDelete) {
    const fullPath = path.join(TEMP_DIR, file);
    await fs.remove(fullPath);
  }

  // 2. Modify desktopRouter.config.tsx
  const routerConfigPath = path.join(
    TEMP_DIR,
    'src/app/[variants]/router/desktopRouter.config.tsx',
  );
  if (fs.existsSync(routerConfigPath)) {
    console.log('  Processing src/app/[variants]/router/desktopRouter.config.tsx...');
    const code = await fs.readFile(routerConfigPath, 'utf8');
    const ast = parse(Lang.Tsx, code);
    const root = ast.root();

    const changelogNode = root.find({
      rule: {
        pattern: "{ path: 'changelog', $$$ }",
      },
    });
    if (changelogNode) {
      changelogNode.replace('');
    }

    const changelogImport = root.find({
      rule: {
        pattern: "import('../(main)/changelog')",
      },
    });
    if (changelogImport) {
      // Find the closest object (route definition) and remove it
      let curr = changelogImport.parent();
      while (curr) {
        if (curr.kind() === 'object') {
          curr.replace('');
          break;
        }
        curr = curr.parent();
      }
    }
    await fs.writeFile(routerConfigPath, root.text());
  }
};

if (isDirectRun(import.meta.url)) {
  await runStandalone('modifyRoutes', modifyRoutes, [
    { lang: Lang.Tsx, path: 'src/app/[variants]/router/desktopRouter.config.tsx' },
  ]);
}
