// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(__dirname, '../..');
const WHEN_CALL = /\bwhen\.(ancestor|descendant|siblingBefore|siblingAfter|anySibling)\(/g;
const COMPILED_CALL = /stylex\.(create|createTheme|defineVars|defineConsts|keyframes)\(/g;

const stripComments = (source: string) =>
  source
    .replaceAll(/\/\*[\S\s]*?\*\//g, (m) => m.replaceAll(/[^\n]/g, ' '))
    .replaceAll(/\/\/.*/g, '');

/** `stylex.when.*` returns a placeholder the compiler rewrites; called anywhere else it throws at runtime. */
export const findWhenCallsOutsideCompiledCalls = (source: string) => {
  const code = stripComments(source);
  const ranges: [number, number][] = [];
  for (const match of code.matchAll(COMPILED_CALL)) {
    let depth = 1;
    let index = match.index + match[0].length;
    while (index < code.length && depth > 0) {
      if (code[index] === '(') depth++;
      else if (code[index] === ')') depth--;
      index++;
    }
    ranges.push([match.index, index]);
  }
  return [...code.matchAll(WHEN_CALL)]
    .filter((m) => !ranges.some(([start, end]) => m.index >= start && m.index < end))
    .map((m) => code.slice(0, m.index).split('\n').length);
};

describe('stylex.when.* calls', () => {
  it('flags a call hoisted into a module constant', () => {
    const source =
      "const HOVER = stylex.when.ancestor(':hover');\nstylex.create({ a: { opacity: { default: 0, [HOVER]: 1 } } });";

    expect(findWhenCallsOutsideCompiledCalls(source)).toEqual([1]);
  });

  it('accepts a call inside stylex.create and ignores comments', () => {
    const source =
      "// stylex.when.ancestor(':hover')\nstylex.create({ a: { opacity: { default: 0, [stylex.when.ancestor(':hover')]: 1 } } });";

    expect(findWhenCallsOutsideCompiledCalls(source)).toEqual([]);
  });

  it('is not used outside stylex.create anywhere in the repo', () => {
    const files = execFileSync(
      'git',
      [
        'grep',
        '-lE',
        'when\\.(ancestor|descendant|siblingBefore|siblingAfter|anySibling)\\(',
        '--',
        '*.ts',
        '*.tsx',
      ],
      { cwd: repoRoot, encoding: 'utf8' },
    )
      .split('\n')
      .filter((file) => file && !file.startsWith('scripts/stylexMigration/'));

    const offenders = files.flatMap((file) =>
      findWhenCallsOutsideCompiledCalls(readFileSync(path.join(repoRoot, file), 'utf8')).map(
        (line) => `${file}:${line}`,
      ),
    );

    expect(offenders).toEqual([]);
  });
});
