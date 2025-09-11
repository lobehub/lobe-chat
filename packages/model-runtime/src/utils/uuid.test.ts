import { describe, expect, it } from 'vitest';

import { createNanoId, nanoid } from './uuid';

describe('createNanoId', () => {
  it('should create a function that generates IDs of specified length', () => {
    const generate8 = createNanoId(8);
    const id8 = generate8();

    expect(typeof id8).toBe('string');
    expect(id8).toHaveLength(8);
  });

  it('should create a function that generates IDs of custom length', () => {
    const generate16 = createNanoId(16);
    const id16 = generate16();

    expect(typeof id16).toBe('string');
    expect(id16).toHaveLength(16);
  });

  it('should default to size 8 when no size provided', () => {
    const generate = createNanoId();
    const id = generate();

    expect(id).toHaveLength(8);
  });

  it('should only use allowed characters', () => {
    const allowedChars = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const generate = createNanoId(100); // Large size to test character set
    const id = generate();

    for (const char of id) {
      expect(allowedChars).toContain(char);
    }
  });

  it('should generate different IDs on multiple calls', () => {
    const generate = createNanoId(8);
    const id1 = generate();
    const id2 = generate();
    const id3 = generate();

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it('should handle edge cases for size', () => {
    const generate1 = createNanoId(1);
    const id1 = generate1();
    expect(id1).toHaveLength(1);

    const generate0 = createNanoId(0);
    const id0 = generate0();
    expect(id0).toHaveLength(0);
    expect(id0).toBe('');
  });

  it('should work with large sizes', () => {
    const generate100 = createNanoId(100);
    const id100 = generate100();

    expect(id100).toHaveLength(100);
    expect(typeof id100).toBe('string');
  });
});

describe('nanoid', () => {
  it('should be a function that generates 8-character IDs by default', () => {
    expect(typeof nanoid).toBe('function');

    const id = nanoid();
    expect(typeof id).toBe('string');
    expect(id).toHaveLength(8);
  });

  it('should generate different IDs on multiple calls', () => {
    const id1 = nanoid();
    const id2 = nanoid();
    const id3 = nanoid();

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it('should only use allowed characters', () => {
    const allowedChars = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const id = nanoid();

    for (const char of id) {
      expect(allowedChars).toContain(char);
    }
  });

  it('should be consistent with createNanoId(8)', () => {
    const customNanoid = createNanoId(8);

    const id1 = nanoid();
    const id2 = customNanoid();

    // They should have the same length and character set
    expect(id1).toHaveLength(8);
    expect(id2).toHaveLength(8);

    // Test character sets are the same
    const allowedChars = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const char of id1) {
      expect(allowedChars).toContain(char);
    }
    for (const char of id2) {
      expect(allowedChars).toContain(char);
    }
  });

  it('should generate statistically unique IDs', () => {
    const ids = new Set();
    const count = 1000;

    for (let i = 0; i < count; i++) {
      ids.add(nanoid());
    }

    // With 8 characters from 62-char alphabet, collision should be extremely rare
    expect(ids.size).toBe(count);
  });
});
