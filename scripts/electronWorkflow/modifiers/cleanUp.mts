import { Lang, parse } from '@ast-grep/napi';
import fs from 'fs-extra';
import path from 'node:path';

import { isDirectRun, runStandalone } from './utils.mjs';

export const cleanUpCode = async (TEMP_DIR: string) => {
  // Remove 'use server'
  const filesToRemoveUseServer = [
    'src/components/mdx/Image.tsx',
    'src/features/DevPanel/CacheViewer/getCacheEntries.ts',
    'src/server/translation.ts',
  ];

  for (const file of filesToRemoveUseServer) {
    const filePath = path.join(TEMP_DIR, file);
    if (fs.existsSync(filePath)) {
      console.log(`  Processing ${file}...`);
      const code = await fs.readFile(filePath, 'utf8');
      const ast = parse(Lang.TypeScript, code);
      const root = ast.root();

      // 'use server' is usually an expression statement at the top
      // We look for the literal string 'use server' or "use server"
      const useServer =
        root.find({
          rule: {
            pattern: "'use server'",
          },
        }) ||
        root.find({
          rule: {
            pattern: '"use server"',
          },
        });

      if (useServer) {
        // Find the statement containing this string
        let curr = useServer.parent();
        while (curr) {
          if (curr.kind() === 'expression_statement') {
            curr.replace('');
            break;
          }
          if (curr.kind() === 'program') break;
          curr = curr.parent();
        }
      }

      await fs.writeFile(filePath, root.text());
    }
  }
};

if (isDirectRun(import.meta.url)) {
  await runStandalone('cleanUpCode', cleanUpCode, [
    { lang: Lang.Tsx, path: 'src/components/mdx/Image.tsx' },
    { lang: Lang.TypeScript, path: 'src/features/DevPanel/CacheViewer/getCacheEntries.ts' },
    { lang: Lang.TypeScript, path: 'src/server/translation.ts' },
  ]);
}
