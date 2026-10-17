import { describe, expect, it } from 'vitest';

import { formatDotenv, parseDotenv } from './EnvironmentVariables';

describe('parseDotenv', () => {
  it('should read KEY=value lines and skip blanks and comments', () => {
    expect(
      parseDotenv('# comment\n\nNODE_ENV=production\nexport API_URL = https://x.dev\n'),
    ).toEqual({
      entries: [
        ['NODE_ENV', 'production'],
        ['API_URL', 'https://x.dev'],
      ],
    });
  });

  it('should strip a matching pair of quotes and let later lines win', () => {
    expect(parseDotenv('A="with space"\nB=\'x\'\nA=second')).toEqual({
      entries: [
        ['A', 'second'],
        ['B', 'x'],
      ],
    });
  });

  it('should name the first line that is not a pair', () => {
    expect(parseDotenv('OK=1\nnot a pair\nALSO=2')).toEqual({ line: 2 });
    expect(parseDotenv('1BAD=x')).toEqual({ line: 1 });
  });

  it('should round-trip through formatDotenv', () => {
    const entries: [string, string][] = [
      ['PLAIN', 'value'],
      ['SPACED', 'two words'],
      ['HASH', 'a#b'],
    ];
    expect(parseDotenv(formatDotenv(entries))).toEqual({ entries });
  });

  it.each([
    'say "hello" C:\\qa',
    '"quoted"',
    'both \'single\' and "double" quotes',
    'line one\nline two\r\nlast',
    'tab\there',
    '  padded  ',
    '\\n is literal',
    'control\u0000character',
  ])('should preserve %j across repeated raw editor saves', (value) => {
    const entries: [string, string][] = [['QA_VALUE', value]];
    const first = parseDotenv(formatDotenv(entries));
    expect(first).toEqual({ entries });
    if ('entries' in first) {
      expect(parseDotenv(formatDotenv(first.entries))).toEqual({ entries });
    }
  });

  it('should retain literal backslashes in single-quoted and unquoted imports', () => {
    expect(
      parseDotenv(String.raw`A='C:\test\new'
B=C:\test\new
C="C:\qa"`),
    ).toEqual({
      entries: [
        ['A', String.raw`C:\test\new`],
        ['B', String.raw`C:\test\new`],
        ['C', String.raw`C:\qa`],
      ],
    });
  });
});
