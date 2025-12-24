import { MessageContentPart } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import { deserializeParts, serializePartsForStorage } from './multimodalContent';

describe('multimodalContent', () => {
  describe('serializePartsForStorage', () => {
    it('should serialize an array of content parts to JSON string', () => {
      const parts: MessageContentPart[] = [
        { type: 'text' as const, text: 'Hello world' },
        { type: 'image' as const, image: 'https://example.com/image.jpg' },
      ];

      const result = serializePartsForStorage(parts);

      expect(result).toBe(JSON.stringify(parts));
      expect(typeof result).toBe('string');
    });

    it('should serialize a single text content part', () => {
      const parts: MessageContentPart[] = [{ type: 'text' as const, text: 'Single message' }];

      const result = serializePartsForStorage(parts);

      expect(result).toBe('[{"type":"text","text":"Single message"}]');
    });

    it('should serialize empty array', () => {
      const parts: any[] = [];

      const result = serializePartsForStorage(parts);

      expect(result).toBe('[]');
    });

    it('should serialize complex nested content', () => {
      const parts: MessageContentPart[] = [
        {
          type: 'text' as const,
          text: 'Description',
        },
        {
          type: 'image' as const,
          image: 'data:image/png;base64,iVBORw0KGgo...',
        },
      ];

      const result = serializePartsForStorage(parts);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(parts);
    });

    it('should handle special characters in text content', () => {
      const parts: MessageContentPart[] = [
        {
          type: 'text' as const,
          text: 'Special chars: "quotes", \\backslash, \nnewline, \ttab',
        },
      ];

      const result = serializePartsForStorage(parts);
      const parsed = JSON.parse(result);

      if (parts[0].type === 'text') {
        expect(parsed[0].text).toBe(parts[0].text);
      }
    });

    it('should serialize multiple content parts of same type', () => {
      const parts: MessageContentPart[] = [
        { type: 'text' as const, text: 'First part' },
        { type: 'text' as const, text: 'Second part' },
        { type: 'text' as const, text: 'Third part' },
      ];

      const result = serializePartsForStorage(parts);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveLength(3);
      expect(parsed).toEqual(parts);
    });
  });

  describe('deserializeParts', () => {
    it('should deserialize valid JSON array of parts', () => {
      const jsonString = '[{"type":"text","text":"Hello"}]';

      const result = deserializeParts(jsonString);

      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(result![0]).toEqual({ type: 'text', text: 'Hello' });
    });

    it('should deserialize multiple content parts', () => {
      const jsonString = JSON.stringify([
        { type: 'text', text: 'Description' },
        { type: 'image', image: 'https://example.com/img.jpg' },
      ]);

      const result = deserializeParts(jsonString);

      expect(result).not.toBeNull();
      expect(result).toHaveLength(2);
      expect(result![0].type).toBe('text');
      expect(result![1].type).toBe('image');
    });

    it('should return null for plain text string', () => {
      const plainText = 'This is just plain text, not JSON';

      const result = deserializeParts(plainText);

      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      const invalidJson = '{invalid json}';

      const result = deserializeParts(invalidJson);

      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = deserializeParts('');

      expect(result).toBeNull();
    });

    it('should return null for JSON object (not array)', () => {
      const jsonObject = '{"type":"text","text":"Hello"}';

      const result = deserializeParts(jsonObject);

      expect(result).toBeNull();
    });

    it('should return null for empty JSON array', () => {
      const emptyArray = '[]';

      const result = deserializeParts(emptyArray);

      expect(result).toBeNull();
    });

    it('should return null for array without type property', () => {
      const noTypeArray = '[{"text":"Hello"}]';

      const result = deserializeParts(noTypeArray);

      expect(result).toBeNull();
    });

    it('should return null for array with null/undefined first element', () => {
      const nullFirstElement = '[null, {"type":"text","text":"Hello"}]';

      const result = deserializeParts(nullFirstElement);

      expect(result).toBeNull();
    });

    it('should deserialize array with first element having type property', () => {
      const validArray = '[{"type":"text","text":"First"},{"text":"Second"}]';

      const result = deserializeParts(validArray);

      // Should succeed because first element has type
      expect(result).not.toBeNull();
      expect(result![0].type).toBe('text');
    });

    it('should handle special characters in deserialized content', () => {
      const testPart: MessageContentPart = {
        type: 'text' as const,
        text: 'Special: "quotes", \\slashes, \nnewlines',
      };
      const parts = [testPart];
      const serialized = JSON.stringify(parts);

      const result = deserializeParts(serialized);

      expect(result).not.toBeNull();
      if (result && result[0].type === 'text' && testPart.type === 'text') {
        expect(result[0].text).toBe(testPart.text);
      }
    });

    it('should deserialize image content part', () => {
      const jsonString = JSON.stringify([
        {
          type: 'image',
          image: 'https://example.com/photo.jpg',
        },
      ]);

      const result = deserializeParts(jsonString);

      expect(result).not.toBeNull();
      expect(result![0].type).toBe('image');
      expect(result![0]).toHaveProperty('image');
    });

    it('should round-trip serialize and deserialize', () => {
      const originalParts: MessageContentPart[] = [
        { type: 'text' as const, text: 'Hello world' },
        { type: 'image' as const, image: 'https://example.com/img.png' },
      ];

      const serialized = serializePartsForStorage(originalParts);
      const deserialized = deserializeParts(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized).toEqual(originalParts);
    });

    it('should handle JSON with nested objects', () => {
      const complexParts = [
        {
          type: 'custom',
          data: {
            nested: {
              deeply: {
                value: 'test',
              },
            },
          },
        },
      ];
      const serialized = JSON.stringify(complexParts);

      const result = deserializeParts(serialized);

      expect(result).not.toBeNull();
      expect(result![0].type).toBe('custom');
    });

    it('should return null for non-string input', () => {
      // @ts-expect-error: Testing with invalid input type
      const result = deserializeParts(123);

      expect(result).toBeNull();
    });

    it('should return null for JSON array of primitives', () => {
      const primitiveArray = '[1, 2, 3, "text"]';

      const result = deserializeParts(primitiveArray);

      expect(result).toBeNull();
    });

    it('should deserialize array with undefined type on later elements', () => {
      const mixedArray = '[{"type":"text","text":"First"},{"content":"no type"}]';

      const result = deserializeParts(mixedArray);

      // Should succeed because validation only checks first element
      expect(result).not.toBeNull();
      expect(result![0].type).toBe('text');
    });
  });

  describe('edge cases', () => {
    it('should handle very long text content', () => {
      const longText = 'a'.repeat(10000);
      const parts: MessageContentPart[] = [{ type: 'text' as const, text: longText }];

      const serialized = serializePartsForStorage(parts);
      const deserialized = deserializeParts(serialized);

      expect(deserialized).not.toBeNull();
      if (deserialized && deserialized[0].type === 'text') {
        expect(deserialized[0].text).toHaveLength(10000);
      }
    });

    it('should handle unicode characters', () => {
      const parts: MessageContentPart[] = [
        { type: 'text' as const, text: '你好世界 🌍 émojis 😀' },
      ];

      const serialized = serializePartsForStorage(parts);
      const deserialized = deserializeParts(serialized);

      expect(deserialized).not.toBeNull();
      if (deserialized && deserialized[0].type === 'text') {
        expect(deserialized[0].text).toBe('你好世界 🌍 émojis 😀');
      }
    });

    it('should handle base64 encoded images', () => {
      const base64Image =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const parts: MessageContentPart[] = [
        {
          type: 'image' as const,
          image: base64Image,
        },
      ];

      const serialized = serializePartsForStorage(parts);
      const deserialized = deserializeParts(serialized);

      expect(deserialized).not.toBeNull();
      if (deserialized && deserialized[0].type === 'image') {
        expect(deserialized[0].image).toBe(base64Image);
      }
    });
  });
});
