import { Lang, parse } from '@ast-grep/napi';
import fs from 'fs-extra';
import path from 'node:path';

import { isDirectRun, runStandalone } from './utils.mjs';

interface Edit {
  end: number;
  start: number;
  text: string;
}

export const modifyNextConfig = async (TEMP_DIR: string) => {
  const nextConfigPath = path.join(TEMP_DIR, 'next.config.ts');
  if (!fs.existsSync(nextConfigPath)) return;

  console.log('  Processing next.config.ts...');
  const code = await fs.readFile(nextConfigPath, 'utf8');
  const ast = parse(Lang.TypeScript, code);
  const root = ast.root();
  const edits: Edit[] = [];

  // Find nextConfig declaration
  const nextConfigDecl = root.find({
    rule: {
      pattern: 'const nextConfig: NextConfig = { $$$ }',
    },
  });

  if (nextConfigDecl) {
    // 1. Remove redirects
    const redirectsProp = nextConfigDecl.find({
      rule: {
        kind: 'property_identifier',
        regex: '^redirects$',
      },
    });
    if (redirectsProp) {
      let curr = redirectsProp.parent();
      while (curr) {
        if (curr.kind() === 'pair') {
          const range = curr.range();
          edits.push({ end: range.end.index, start: range.start.index, text: '' });
          break;
        }
        if (curr.kind() === 'object') break;
        curr = curr.parent();
      }
    }

    // 2. Remove headers
    const headersProp = nextConfigDecl.find({
      rule: {
        kind: 'property_identifier',
        regex: '^headers$',
      },
    });
    if (headersProp) {
      let curr = headersProp.parent();
      while (curr) {
        if (curr.kind() === 'pair' || curr.kind() === 'method_definition') {
          const range = curr.range();
          edits.push({ end: range.end.index, start: range.start.index, text: '' });
          break;
        }
        if (curr.kind() === 'object') break;
        curr = curr.parent();
      }
    }

    // 3. Remove spread element
    const spread = nextConfigDecl.find({
      rule: {
        kind: 'spread_element',
      },
    });
    if (spread) {
      const range = spread.range();
      edits.push({ end: range.end.index, start: range.start.index, text: '' });
    }

    // 4. Inject output: 'export'
    const objectNode = nextConfigDecl.find({
      rule: { kind: 'object' },
    });

    if (objectNode) {
      const range = objectNode.range();
      // Insert after the opening brace `{
      edits.push({
        end: range.start.index + 1,
        start: range.start.index + 1,
        text: "\n  output: 'export',",
      });
    }
  }

  // Remove withPWA wrapper
  const withPWA = root.find({
    rule: {
      pattern: 'withPWA($A)',
    },
  });
  if (withPWA) {
    const inner = withPWA.getMatch('A');
    if (inner) {
      const range = withPWA.range();
      edits.push({ end: range.end.index, start: range.start.index, text: inner.text() });
    }
  }

  // Apply edits
  edits.sort((a, b) => b.start - a.start);
  let newCode = code;
  for (const edit of edits) {
    newCode = newCode.slice(0, edit.start) + edit.text + newCode.slice(edit.end);
  }

  // Cleanup commas (syntax fix)
  // 1. Double commas ,, -> , (handle spaces/newlines between)
  newCode = newCode.replaceAll(/,(\s*,)+/g, ',');
  // 2. Leading comma in object { , -> {
  newCode = newCode.replaceAll(/{\s*,/g, '{');
  // 3. Trailing comma before closing brace is valid in JS/TS

  await fs.writeFile(nextConfigPath, newCode);
};

if (isDirectRun(import.meta.url)) {
  await runStandalone('modifyNextConfig', modifyNextConfig, [
    { lang: Lang.TypeScript, path: process.cwd() + '/next.config.ts' },
  ]);
}
