import type { HumanInterventionConfig } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import { InterventionChecker } from '../InterventionChecker';

describe('InterventionChecker', () => {
  describe('shouldIntervene', () => {
    it('should return never when config is undefined', () => {
      const result = InterventionChecker.shouldIntervene({ config: undefined, toolArgs: {} });
      expect(result).toBe('never');
    });

    it('should return the policy when config is a simple string', () => {
      expect(InterventionChecker.shouldIntervene({ config: 'never', toolArgs: {} })).toBe('never');
      expect(InterventionChecker.shouldIntervene({ config: 'required', toolArgs: {} })).toBe(
        'required',
      );
    });

    it('should match rules in order and return first match', () => {
      const config: HumanInterventionConfig = [
        { match: { command: 'ls:*' }, policy: 'never' },
        { match: { command: 'git commit:*' }, policy: 'required' },
        { policy: 'required' }, // Default rule
      ];

      expect(InterventionChecker.shouldIntervene({ config, toolArgs: { command: 'ls:' } })).toBe(
        'never',
      );
      expect(
        InterventionChecker.shouldIntervene({ config, toolArgs: { command: 'git commit:' } }),
      ).toBe('required');
      expect(
        InterventionChecker.shouldIntervene({ config, toolArgs: { command: 'rm -rf /' } }),
      ).toBe('required');
    });

    it('should return require as default when no rule matches', () => {
      const config: HumanInterventionConfig = [{ match: { command: 'ls:*' }, policy: 'never' }];

      const result = InterventionChecker.shouldIntervene({
        config,
        toolArgs: { command: 'rm -rf /' },
      });
      expect(result).toBe('required');
    });

    it('should handle multiple parameter matching', () => {
      const config: HumanInterventionConfig = [
        {
          match: {
            command: 'git add:*',
            path: '/Users/project/*',
          },
          policy: 'never',
        },
        { policy: 'required' },
      ];

      // Both match
      expect(
        InterventionChecker.shouldIntervene({
          config,
          toolArgs: {
            command: 'git add:.',
            path: '/Users/project/file.ts',
          },
        }),
      ).toBe('never');

      // Only one matches
      expect(
        InterventionChecker.shouldIntervene({
          config,
          toolArgs: {
            command: 'git add:.',
            path: '/tmp/file.ts',
          },
        }),
      ).toBe('required');
    });

    it('should handle default rule without match', () => {
      const config: HumanInterventionConfig = [
        { match: { command: 'ls:*' }, policy: 'never' },
        { policy: 'required' }, // Default rule
      ];

      const result = InterventionChecker.shouldIntervene({
        config,
        toolArgs: { command: 'anything' },
      });
      expect(result).toBe('required');
    });
  });

  describe('matchPattern', () => {
    it('should match exact strings', () => {
      expect(InterventionChecker['matchPattern']('hello', 'hello')).toBe(true);
      expect(InterventionChecker['matchPattern']('hello', 'world')).toBe(false);
    });

    it('should match wildcard patterns', () => {
      expect(InterventionChecker['matchPattern']('*.ts', 'file.ts')).toBe(true);
      expect(InterventionChecker['matchPattern']('*.ts', 'file.js')).toBe(false);
      expect(InterventionChecker['matchPattern']('test*', 'test123')).toBe(true);
      expect(InterventionChecker['matchPattern']('test*', 'abc123')).toBe(false);
    });

    it('should match colon-based prefix patterns', () => {
      expect(InterventionChecker['matchPattern']('git add:*', 'git add:')).toBe(true);
      expect(InterventionChecker['matchPattern']('git add:*', 'git add:.')).toBe(true);
      expect(InterventionChecker['matchPattern']('git add:*', 'git add:--all')).toBe(true);
      expect(InterventionChecker['matchPattern']('git add:*', 'git commit')).toBe(false);
    });

    it('should match path patterns', () => {
      expect(
        InterventionChecker['matchPattern']('/Users/project/*', '/Users/project/file.ts'),
      ).toBe(true);
      expect(InterventionChecker['matchPattern']('/Users/project/*', '/tmp/file.ts')).toBe(false);
    });
  });

  describe('matchesArgument', () => {
    it('should match exact type', () => {
      const matcher = { pattern: 'git add', type: 'exact' as const };
      expect(InterventionChecker['matchesArgument'](matcher, 'git add')).toBe(true);
      expect(InterventionChecker['matchesArgument'](matcher, 'git add:.')).toBe(false);
    });

    it('should match prefix type', () => {
      const matcher = { pattern: 'git add', type: 'prefix' as const };
      expect(InterventionChecker['matchesArgument'](matcher, 'git add')).toBe(true);
      expect(InterventionChecker['matchesArgument'](matcher, 'git add:.')).toBe(true);
      expect(InterventionChecker['matchesArgument'](matcher, 'git commit')).toBe(false);
    });

    it('should match wildcard type', () => {
      const matcher = { pattern: 'git *', type: 'wildcard' as const };
      expect(InterventionChecker['matchesArgument'](matcher, 'git add')).toBe(true);
      expect(InterventionChecker['matchesArgument'](matcher, 'git commit')).toBe(true);
      expect(InterventionChecker['matchesArgument'](matcher, 'npm install')).toBe(false);
    });

    it('should match regex type', () => {
      const matcher = { pattern: '^git (add|commit)', type: 'regex' as const };
      expect(InterventionChecker['matchesArgument'](matcher, 'git add')).toBe(true);
      expect(InterventionChecker['matchesArgument'](matcher, 'git commit')).toBe(true);
      expect(InterventionChecker['matchesArgument'](matcher, 'git push')).toBe(false);
    });

    it('should handle simple string matcher', () => {
      expect(InterventionChecker['matchesArgument']('git add:*', 'git add:.')).toBe(true);
      expect(InterventionChecker['matchesArgument']('*.ts', 'file.ts')).toBe(true);
      expect(InterventionChecker['matchesArgument']('exact', 'exact')).toBe(true);
    });
  });

  describe('generateToolKey', () => {
    it('should generate key without args hash', () => {
      const key = InterventionChecker.generateToolKey('web-browsing', 'crawlSinglePage');
      expect(key).toBe('web-browsing/crawlSinglePage');
    });

    it('should generate key with args hash', () => {
      const key = InterventionChecker.generateToolKey('bash', 'bash', 'a1b2c3');
      expect(key).toBe('bash/bash#a1b2c3');
    });
  });

  describe('hashArguments', () => {
    it('should generate consistent hash for same arguments', () => {
      const args1 = { command: 'ls -la', path: '/tmp' };
      const args2 = { command: 'ls -la', path: '/tmp' };

      const hash1 = InterventionChecker.hashArguments(args1);
      const hash2 = InterventionChecker.hashArguments(args2);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different arguments', () => {
      const args1 = { command: 'ls -la' };
      const args2 = { command: 'ls -l' };

      const hash1 = InterventionChecker.hashArguments(args1);
      const hash2 = InterventionChecker.hashArguments(args2);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle key order independence', () => {
      const args1 = { a: 1, b: 2 };
      const args2 = { b: 2, a: 1 };

      const hash1 = InterventionChecker.hashArguments(args1);
      const hash2 = InterventionChecker.hashArguments(args2);

      expect(hash1).toBe(hash2);
    });

    it('should handle empty arguments', () => {
      const hash = InterventionChecker.hashArguments({});
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should handle complex nested objects', () => {
      const args = {
        config: { nested: { value: 'test' } },
        array: [1, 2, 3],
      };

      const hash = InterventionChecker.hashArguments(args);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle Bash tool scenario', () => {
      const config: HumanInterventionConfig = [
        { match: { command: 'ls:*' }, policy: 'never' },
        { match: { command: 'git add:*' }, policy: 'required' },
        { match: { command: 'git commit:*' }, policy: 'required' },
        { match: { command: 'rm:*' }, policy: 'required' },
        { policy: 'required' },
      ];

      // Safe commands - never
      expect(InterventionChecker.shouldIntervene({ config, toolArgs: { command: 'ls:' } })).toBe(
        'never',
      );

      // Git commands - require
      expect(
        InterventionChecker.shouldIntervene({ config, toolArgs: { command: 'git add:.' } }),
      ).toBe('required');
      expect(
        InterventionChecker.shouldIntervene({ config, toolArgs: { command: 'git commit:-m' } }),
      ).toBe('required');

      // Dangerous commands - require
      expect(InterventionChecker.shouldIntervene({ config, toolArgs: { command: 'rm:-rf' } })).toBe(
        'required',
      );
      expect(
        InterventionChecker.shouldIntervene({ config, toolArgs: { command: 'npm install' } }),
      ).toBe('required');
    });

    it('should handle LocalSystem tool scenario', () => {
      const config: HumanInterventionConfig = [
        { match: { path: '/Users/project/*' }, policy: 'never' },
        { policy: 'required' },
      ];

      // Project directory - never
      expect(
        InterventionChecker.shouldIntervene({
          config,
          toolArgs: { path: '/Users/project/file.ts' },
        }),
      ).toBe('never');

      // Outside project - require
      expect(
        InterventionChecker.shouldIntervene({ config, toolArgs: { path: '/tmp/file.ts' } }),
      ).toBe('required');
    });

    it('should handle Web Browsing tool with simple policy', () => {
      const config: HumanInterventionConfig = 'required';

      expect(
        InterventionChecker.shouldIntervene({ config, toolArgs: { url: 'https://example.com' } }),
      ).toBe('required');
    });
  });
});
