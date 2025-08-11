import { describe, expect, it } from 'vitest';

import { argsToString, parseArgs } from './args';

describe('args', () => {
  describe('parseArgs', () => {
    it('should parse simple arguments', () => {
      expect(parseArgs('arg1 arg2 arg3')).toEqual(['arg1', 'arg2', 'arg3']);
    });

    it('should handle empty string', () => {
      expect(parseArgs('')).toEqual([]);
    });

    it('should handle single argument', () => {
      expect(parseArgs('single')).toEqual(['single']);
    });

    it('should handle arguments with double quotes', () => {
      expect(parseArgs('arg1 "arg with spaces" arg3')).toEqual(['arg1', 'arg with spaces', 'arg3']);
    });

    it('should handle arguments with single quotes', () => {
      expect(parseArgs("arg1 'arg with spaces' arg3")).toEqual(['arg1', 'arg with spaces', 'arg3']);
    });

    it('should handle escaped quotes', () => {
      expect(parseArgs('arg1 "escaped \\"quote\\"" arg3')).toEqual([
        'arg1',
        'escaped "quote"',
        'arg3',
      ]);
    });

    it('should handle mixed quotes', () => {
      expect(parseArgs('arg1 "double quote" \'single quote\' arg4')).toEqual([
        'arg1',
        'double quote',
        'single quote',
        'arg4',
      ]);
    });

    it('should handle multiple spaces', () => {
      expect(parseArgs('arg1    arg2     arg3')).toEqual(['arg1', 'arg2', 'arg3']);
    });

    it('should handle leading and trailing spaces', () => {
      expect(parseArgs('  arg1 arg2 arg3  ')).toEqual(['arg1', 'arg2', 'arg3']);
    });

    it('should handle unclosed quotes gracefully', () => {
      expect(parseArgs('arg1 "unclosed quote')).toEqual(['arg1', 'unclosed quote']);
    });
  });

  describe('argsToString', () => {
    it('should convert simple arguments to string', () => {
      expect(argsToString(['arg1', 'arg2', 'arg3'])).toBe('arg1 arg2 arg3');
    });

    it('should handle empty array', () => {
      expect(argsToString([])).toBe('');
    });

    it('should quote arguments with spaces', () => {
      expect(argsToString(['arg1', 'arg with spaces', 'arg3'])).toBe('arg1 "arg with spaces" arg3');
    });

    it('should use single quotes when double quotes are present', () => {
      expect(argsToString(['arg1', 'arg with "quotes"', 'arg3'])).toBe(
        'arg1 \'arg with "quotes"\' arg3',
      );
    });

    it('should escape double quotes when single quotes are also present', () => {
      expect(argsToString(['arg1', 'arg with "double" and \'single\' quotes', 'arg3'])).toBe(
        'arg1 "arg with \\"double\\" and \'single\' quotes" arg3',
      );
    });

    it('should handle arguments with special characters', () => {
      expect(argsToString(['arg1', 'arg"with"quotes', 'arg3'])).toBe(
        'arg1 \'arg"with"quotes\' arg3',
      );
    });
  });

  describe('parseArgs and argsToString roundtrip', () => {
    it('should maintain consistency for simple args', () => {
      const original = ['arg1', 'arg2', 'arg3'];
      const stringified = argsToString(original);
      const parsed = parseArgs(stringified);
      expect(parsed).toEqual(original);
    });

    it('should maintain consistency for args with spaces', () => {
      const original = ['arg1', 'arg with spaces', 'arg3'];
      const stringified = argsToString(original);
      const parsed = parseArgs(stringified);
      expect(parsed).toEqual(original);
    });

    it('should maintain consistency for complex args', () => {
      const original = ['arg1', 'arg with "quotes"', 'simple', 'arg with spaces'];
      const stringified = argsToString(original);
      const parsed = parseArgs(stringified);
      expect(parsed).toEqual(original);
    });
  });
});
