import { Lang, parse } from '@ast-grep/napi';
import fs from 'fs-extra';
import path from 'node:path';

import { isDirectRun, runStandalone } from './utils.mjs';

export const modifyAppCode = async (TEMP_DIR: string) => {
  // 1. Modify src/app/[variants]/page.tsx
  const variantsPagePath = path.join(TEMP_DIR, 'src/app/[variants]/page.tsx');
  if (fs.existsSync(variantsPagePath)) {
    console.log('  Processing src/app/[variants]/page.tsx...');
    const code = await fs.readFile(variantsPagePath, 'utf8');
    const ast = parse(Lang.TypeScript, code);
    const root = ast.root();

    // Comment out MobileRouter definition
    const mobileRouterDef = root.find({
      rule: {
        pattern: 'const MobileRouter = dynamic($$$)',
      },
    });
    if (mobileRouterDef) {
      const text = mobileRouterDef.text();
      mobileRouterDef.replace(`// ${text}`);
    }

    // Comment out usage: if (isMobile) return <MobileRouter />;
    const mobileUsage = root.find({
      rule: {
        pattern: 'if (isMobile) return <MobileRouter />;',
      },
    });
    if (mobileUsage) {
      const text = mobileUsage.text();
      mobileUsage.replace(`// ${text}`);
    }

    await fs.writeFile(variantsPagePath, root.text());
  }

  // 2. Modify src/layout/GlobalProvider/index.tsx
  const globalProviderPath = path.join(TEMP_DIR, 'src/layout/GlobalProvider/index.tsx');
  if (fs.existsSync(globalProviderPath)) {
    console.log('  Processing src/layout/GlobalProvider/index.tsx...');
    const code = await fs.readFile(globalProviderPath, 'utf8');
    const ast = parse(Lang.Tsx, code);
    const root = ast.root();

    // Comment out import DevPanel
    const devPanelImport = root.find({
      rule: {
        pattern: "import DevPanel from '@/features/DevPanel';",
      },
    });
    if (devPanelImport) {
      const text = devPanelImport.text();
      devPanelImport.replace(`// ${text}`);
    }

    // Comment out <DevPanel /> usage in JSX
    // It's inside a boolean expression: {process.env.NODE_ENV === 'development' && <DevPanel />}
    const devPanelUsage = root.find({
      rule: {
        pattern: "{process.env.NODE_ENV === 'development' && <DevPanel />}",
      },
    });
    if (devPanelUsage) {
      devPanelUsage.replace('{/* DevPanel disabled */}');
    }

    await fs.writeFile(globalProviderPath, root.text());
  }
};

if (isDirectRun(import.meta.url)) {
  await runStandalone('modifyAppCode', modifyAppCode, [
    { lang: Lang.Tsx, path: 'src/app/[variants]/page.tsx' },
    { lang: Lang.Tsx, path: 'src/layout/GlobalProvider/index.tsx' },
  ]);
}
