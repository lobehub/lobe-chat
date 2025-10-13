import { describe, expect, it } from 'vitest';

import { ToolNameResolver } from '../ToolNameResolver';

describe('ToolNameResolver', () => {
  const resolver = new ToolNameResolver();
  describe('generate - basic functionality', () => {
    it('should generate tool name with identifier and api name', () => {
      const result = resolver.generate('test-plugin', 'myAction');
      expect(result).toBe('test-plugin____myAction');
    });

    it('should generate tool name with type suffix', () => {
      const result = resolver.generate('test-plugin', 'myAction', 'builtin');
      expect(result).toBe('test-plugin____myAction____builtin');
    });

    it('should handle default type', () => {
      const result = resolver.generate('test-plugin', 'myAction', 'default');
      expect(result).toBe('test-plugin____myAction');
    });

    it('should handle undefined type as default', () => {
      const result = resolver.generate('test-plugin', 'myAction');
      expect(result).toBe('test-plugin____myAction');
    });
  });

  describe('generate - long name handling', () => {
    it('should shorten long action names using hash', () => {
      // Create a normal identifier with a very long action name
      const identifier = 'my-plugin';
      const longActionName =
        'very-long-action-name-that-will-cause-the-total-length-to-exceed-64-characters';
      const result = resolver.generate(identifier, longActionName, 'builtin');

      // The result should be shorter than the original would have been
      const originalLength = `${identifier}____${longActionName}____builtin`.length;
      expect(result.length).toBeLessThan(originalLength);

      // Should contain the identifier, MD5HASH prefix, and type
      expect(result).toContain(identifier);
      expect(result).toContain('MD5HASH_');
      expect(result).toContain('____builtin');
      expect(result).toMatch(/^my-plugin____MD5HASH_[a-f0-9]+____builtin$/);
    });

    it('should handle identifier that is itself long', () => {
      // Test the original limitation - when identifier itself is very long
      const veryLongIdentifier = 'very-long-plugin-identifier-that-will-cause-overflow';
      const actionName = 'action';
      const result = resolver.generate(veryLongIdentifier, actionName, 'builtin');

      // When the total length exceeds 64, even short action names get hashed
      expect(result).toContain(veryLongIdentifier);
      expect(result).toContain('MD5HASH_');
      expect(result).toContain('____builtin');

      // Verify the pattern matches the expected format
      expect(result).toMatch(
        new RegExp(
          `^${veryLongIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}____MD5HASH_[a-f0-9]+____builtin$`,
        ),
      );
    });

    it('should keep short names unchanged', () => {
      const result = resolver.generate('short', 'action', 'type');
      expect(result).toBe('short____action____type');
      expect(result.length).toBeLessThan(64);
    });

    it('should handle edge case at exactly 64 characters', () => {
      // Create a name that's exactly 64 characters
      const identifier = 'short-id';
      const actionName = 'b'.repeat(44);
      const type = 'type'; // 8 + 4 + 44 + 4 + 4 = 64

      const result = resolver.generate(identifier, actionName, type);

      // When total length >= 64, action name should be hashed
      // Result format: identifier____MD5HASH_xxx____type
      expect(result).toContain(identifier);
      expect(result).toContain('MD5HASH_');
      expect(result).toContain(type);
      // The result should be shorter than the original would have been
      const originalLength = `${identifier}____${actionName}____${type}`.length;
      expect(result.length).toBeLessThan(originalLength);
    });
  });

  describe('generate - special characters and edge cases', () => {
    it('should handle identifiers with special characters', () => {
      const result = resolver.generate('my-plugin_v2', 'action-name', 'builtin');
      expect(result).toBe('my-plugin_v2____action-name____builtin');
    });

    it('should handle empty action name', () => {
      const result = resolver.generate('plugin', '', 'builtin');
      expect(result).toBe('plugin________builtin');
    });

    it('should handle numeric identifiers and action names', () => {
      const result = resolver.generate('plugin123', 'action456', 'type789');
      expect(result).toBe('plugin123____action456____type789');
    });

    it('should be consistent for same inputs', () => {
      const result1 = resolver.generate('plugin', 'action', 'type');
      const result2 = resolver.generate('plugin', 'action', 'type');
      expect(result1).toBe(result2);
    });

    it('should produce different results for different inputs', () => {
      const result1 = resolver.generate('plugin1', 'action', 'type');
      const result2 = resolver.generate('plugin2', 'action', 'type');
      expect(result1).not.toBe(result2);
    });
  });

  describe('generate - hash consistency', () => {
    it('should generate consistent hash for same long action name', () => {
      const identifier = 'plugin';
      const longActionName = 'very-long-action-name-that-will-also-cause-overflow';

      const result1 = resolver.generate(identifier, longActionName, 'builtin');
      const result2 = resolver.generate(identifier, longActionName, 'builtin');

      expect(result1).toBe(result2);
      expect(result1).toContain('MD5HASH_');
    });

    it('should generate different hashes for different long action names', () => {
      const identifier = 'plugin';
      const longActionName1 = 'very-long-action-name-that-will-also-cause-overflow-1';
      const longActionName2 = 'very-long-action-name-that-will-also-cause-overflow-2';

      const result1 = resolver.generate(identifier, longActionName1, 'builtin');
      const result2 = resolver.generate(identifier, longActionName2, 'builtin');

      expect(result1).not.toBe(result2);
      expect(result1).toContain('MD5HASH_');
      expect(result2).toContain('MD5HASH_');
    });
  });

  describe('generate - real-world examples', () => {
    it('should handle builtin tools correctly', () => {
      const result = resolver.generate('lobe-image-designer', 'text2image', 'builtin');
      expect(result).toBe('lobe-image-designer____text2image____builtin');
    });

    it('should handle web browsing tools correctly', () => {
      const result = resolver.generate('lobe-web-browsing', 'search');
      expect(result).toBe('lobe-web-browsing____search');
    });

    it('should handle plugin tools correctly', () => {
      const result = resolver.generate('custom-plugin', 'customAction', 'plugin');
      expect(result).toBe('custom-plugin____customAction____plugin');
    });
  });
});
