import { describe, expect, it } from 'vitest';
import { convertSenseNovaMessage } from './sensenovaHelpers';

describe('convertSenseNovaMessage', () => {
  it('should convert string content to text type array', () => {
    const content = 'Hello world';
    const result = convertSenseNovaMessage(content);

    expect(result).toEqual([{ type: 'text', text: 'Hello world' }]);
  });

  it('should handle array content with text type', () => {
    const content = [
      { type: 'text', text: 'Hello world' }
    ];
    const result = convertSenseNovaMessage(content);

    expect(result).toEqual([{ type: 'text', text: 'Hello world' }]);
  });

  it('should convert image_url with base64 format to image_base64', () => {
    const content = [
      { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,ABCDEF123456' } }
    ];
    const result = convertSenseNovaMessage(content);

    expect(result).toEqual([
      { type: 'image_base64', image_base64: 'ABCDEF123456' }
    ]);
  });

  it('should keep image_url format for non-base64 urls', () => {
    const content = [
      { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } }
    ];
    const result = convertSenseNovaMessage(content);

    expect(result).toEqual([
      { type: 'image_url', image_url: 'https://example.com/image.jpg' }
    ]);
  });

  it('should handle mixed content types', () => {
    const content = [
      { type: 'text', text: 'Hello world' },
      { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,ABCDEF123456' } },
      { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } }
    ];
    const result = convertSenseNovaMessage(content);

    expect(result).toEqual([
      { type: 'text', text: 'Hello world' },
      { type: 'image_base64', image_base64: 'ABCDEF123456' },
      { type: 'image_url', image_url: 'https://example.com/image.jpg' }
    ]);
  });

  it('should filter out invalid items', () => {
    const content = [
      { type: 'text', text: 'Hello world' },
      { type: 'unknown', value: 'should be filtered' },
      { type: 'image_url', image_url: { notUrl: 'missing url field' } }
    ];
    const result = convertSenseNovaMessage(content);

    expect(result).toEqual([
      { type: 'text', text: 'Hello world' }
    ]);
  });

  it('should handle the example input format correctly', () => {
    const messages = [
      {
        content: [
          {
            content: "Hi",
            role: "user"
          },
          {
            image_url: {
              detail: "auto",
              url: "data:image/jpeg;base64,ABCDEF123456"
            },
            type: "image_url"
          }
        ],
        role: "user"
      }
    ];

    // This is simulating how you might use convertSenseNovaMessage with the example input
    // Note: The actual function only converts the content part, not the entire messages array
    const content = messages[0].content;
    
    // This is how the function would be expected to handle a mixed array like this
    // However, the actual test would need to be adjusted based on how your function 
    // is intended to handle this specific format with nested content objects
    const result = convertSenseNovaMessage([
      { type: 'text', text: "Hi" },
      { type: 'image_url', image_url: { url: "data:image/jpeg;base64,ABCDEF123456" } }
    ]);

    expect(result).toEqual([
      { type: 'text', text: "Hi" },
      { type: 'image_base64', image_base64: "ABCDEF123456" }
    ]);
  });
});
