import { pathString } from './url';
import { getFileExtensionFromUrl, inferContentTypeFromImageUrl } from './url';

describe('pathString', () => {
  it('should handle basic path', () => {
    const result = pathString('/home');
    expect(result).toBe('/home');
  });

  it('should handle path with search parameters', () => {
    const result = pathString('/home', { search: 'id=1&name=test' });
    expect(result).toBe('/home?id=1&name=test');
  });

  it('should handle path with hash', () => {
    const result = pathString('/home', { hash: 'top' });
    expect(result).toBe('/home#top');

    const result2 = pathString('/home', { hash: '#hash=abc' });
    expect(result2).toBe('/home#hash=abc');
  });

  it('should handle relative path', () => {
    const result = pathString('./home');
    expect(result).toBe('/home');
  });

  it('should handle absolute path', () => {
    const result = pathString('/home');
    expect(result).toBe('/home');
  });

  it('should handle path with protocol', () => {
    const result = pathString('https://www.example.com/home');
    expect(result).toBe('https://www.example.com/home');
  });

  it('should handle path with hostname', () => {
    const result = pathString('//www.example.com/home');
    expect(result).toBe('https://www.example.com/home');
  });

  it('should handle path with port number', () => {
    const result = pathString('//www.example.com:8080/home');
    expect(result).toBe('https://www.example.com:8080/home');
  });

  it('should handle path with special characters', () => {
    const result = pathString('/home/测试');
    expect(result).toBe('/home/%E6%B5%8B%E8%AF%95');
  });
});

describe('inferContentTypeFromImageUrl', () => {
  it('should return correct MIME type for jpg images', () => {
    const result = inferContentTypeFromImageUrl('https://example.com/image.jpg');
    expect(result).toBe('image/jpeg');
  });

  it('should return correct MIME type for png images', () => {
    const result = inferContentTypeFromImageUrl('https://example.com/image.png');
    expect(result).toBe('image/png');
  });

  it('should return correct MIME type for webp images', () => {
    const result = inferContentTypeFromImageUrl('https://example.com/image.webp');
    expect(result).toBe('image/webp');
  });

  it('should return correct MIME type for gif images', () => {
    const result = inferContentTypeFromImageUrl('https://example.com/image.gif');
    expect(result).toBe('image/gif');
  });

  it('should handle uppercase extensions', () => {
    const result = inferContentTypeFromImageUrl('https://example.com/image.JPG');
    expect(result).toBe('image/jpeg');
  });

  it('should handle URLs with query parameters', () => {
    const result = inferContentTypeFromImageUrl('https://example.com/image.png?v=123&size=large');
    expect(result).toBe('image/png');
  });

  it('should handle URLs with hash fragments', () => {
    const result = inferContentTypeFromImageUrl('https://example.com/image.jpg#section');
    expect(result).toBe('image/jpeg');
  });

  it('should throw error when no extension', () => {
    expect(() => {
      inferContentTypeFromImageUrl('https://example.com/image');
    }).toThrow('Invalid image url: https://example.com/image');
  });

  it('should throw error when only dot without extension', () => {
    expect(() => {
      inferContentTypeFromImageUrl('https://example.com/image.');
    }).toThrow('Invalid image url: https://example.com/image.');
  });

  it('should handle multiple dots in path', () => {
    const result = inferContentTypeFromImageUrl('https://example.com/my.folder/image.test.png');
    expect(result).toBe('image/png');
  });

  it('should handle complex query parameters and hash combination', () => {
    const result = inferContentTypeFromImageUrl(
      'https://example.com/image.jpeg?width=800&height=600&format=jpeg#preview',
    );
    expect(result).toBe('image/jpeg');
  });

  it('should handle mixed case extensions', () => {
    const result = inferContentTypeFromImageUrl('https://example.com/image.JpEg');
    expect(result).toBe('image/jpeg');
  });

  it('should handle BMP format', () => {
    const result = inferContentTypeFromImageUrl('https://example.com/image.bmp');
    expect(result).toBe('image/bmp');
  });

  it('should handle TIFF format', () => {
    const result = inferContentTypeFromImageUrl('https://example.com/image.tiff');
    expect(result).toBe('image/tiff');
  });

  it('should handle SVG format', () => {
    const result = inferContentTypeFromImageUrl('https://example.com/image.svg');
    expect(result).toBe('image/svg+xml');
  });

  it('should throw error for invalid URLs', () => {
    expect(() => {
      inferContentTypeFromImageUrl('invalid-url');
    }).toThrow('Invalid image url: invalid-url');
  });

  it('should throw error for empty string', () => {
    expect(() => {
      inferContentTypeFromImageUrl('');
    }).toThrow('Invalid image url: ');
  });

  it('should throw error for non-image extensions', () => {
    expect(() => {
      inferContentTypeFromImageUrl('https://example.com/document.txt');
    }).toThrow('Invalid image url: https://example.com/document.txt');
  });

  it('should throw error for unknown extensions', () => {
    expect(() => {
      inferContentTypeFromImageUrl('https://example.com/file.unknownext');
    }).toThrow('Invalid image url: https://example.com/file.unknownext');
  });

  it('should handle URLs with port numbers', () => {
    const result = inferContentTypeFromImageUrl('https://example.com:8080/image.png');
    expect(result).toBe('image/png');
  });

  it('should handle deeply nested paths', () => {
    const result = inferContentTypeFromImageUrl(
      'https://cdn.example.com/assets/images/gallery/2024/photo.jpg',
    );
    expect(result).toBe('image/jpeg');
  });

  it('should handle encoded filenames', () => {
    const result = inferContentTypeFromImageUrl(
      'https://example.com/images/%E5%9B%BE%E7%89%87.png',
    );
    expect(result).toBe('image/png');
  });

  it('should handle protocol-relative URLs', () => {
    const result = inferContentTypeFromImageUrl('//example.com/image.webp');
    expect(result).toBe('image/webp');
  });

  it('should throw error for single character extensions (if no valid MIME type)', () => {
    expect(() => {
      inferContentTypeFromImageUrl('https://example.com/file.x');
    }).toThrow('Invalid image url: https://example.com/file.x');
  });

  it('should throw error for dot at end of path', () => {
    expect(() => {
      inferContentTypeFromImageUrl('https://example.com/path/.');
    }).toThrow('Invalid image url: https://example.com/path/.');
  });
});

describe('getFileExtensionFromUrl', () => {
  it('should return jpg extension', () => {
    const result = getFileExtensionFromUrl('https://example.com/image.jpg');
    expect(result).toBe('jpg');
  });

  it('should return png extension', () => {
    const result = getFileExtensionFromUrl('https://example.com/image.png');
    expect(result).toBe('png');
  });

  it('should return webp extension', () => {
    const result = getFileExtensionFromUrl('https://example.com/image.webp');
    expect(result).toBe('webp');
  });

  it('should handle jpeg extension', () => {
    const result = getFileExtensionFromUrl('https://example.com/image.jpeg');
    expect(result).toBe('jpeg');
  });

  it('should handle gif extension', () => {
    const result = getFileExtensionFromUrl('https://example.com/image.gif');
    expect(result).toBe('gif');
  });

  it('should handle svg extension', () => {
    const result = getFileExtensionFromUrl('https://example.com/image.svg');
    expect(result).toBe('svg');
  });

  it('should handle uppercase extensions and convert to lowercase', () => {
    const result = getFileExtensionFromUrl('https://example.com/image.PNG');
    expect(result).toBe('png');
  });

  it('should handle mixed case extensions', () => {
    const result = getFileExtensionFromUrl('https://example.com/image.JpEg');
    expect(result).toBe('jpeg');
  });

  it('should handle URLs with query parameters', () => {
    const result = getFileExtensionFromUrl('https://example.com/image.jpg?v=123&size=large');
    expect(result).toBe('jpg');
  });

  it('should handle URLs with hash fragments', () => {
    const result = getFileExtensionFromUrl('https://example.com/image.png#section');
    expect(result).toBe('png');
  });

  it('should handle multiple dots in path', () => {
    const result = getFileExtensionFromUrl('https://example.com/my.folder/image.test.webp');
    expect(result).toBe('webp');
  });

  it('should return default png when no extension', () => {
    const result = getFileExtensionFromUrl('https://example.com/image');
    expect(result).toBe('png');
  });

  it('should return default png when only dot without extension', () => {
    const result = getFileExtensionFromUrl('https://example.com/image.');
    expect(result).toBe('png');
  });

  it('should return default png for non-image extensions', () => {
    const result = getFileExtensionFromUrl('https://example.com/document.txt');
    expect(result).toBe('png');
  });

  it('should return default png for other format extensions', () => {
    const result = getFileExtensionFromUrl('https://example.com/video.mp4');
    expect(result).toBe('png');
  });

  it('should handle invalid URLs and return default', () => {
    const result = getFileExtensionFromUrl('invalid-url');
    expect(result).toBe('png');
  });

  it('should handle empty string URLs and return default', () => {
    const result = getFileExtensionFromUrl('');
    expect(result).toBe('png');
  });

  it('should handle all supported image extensions', () => {
    const supportedExtensions = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'tiff', 'tif'];

    supportedExtensions.forEach((ext) => {
      const result = getFileExtensionFromUrl(`https://example.com/image.${ext}`);
      expect(result).toBe(ext);
    });
  });

  it('should handle URLs with port numbers', () => {
    const result = getFileExtensionFromUrl('https://example.com:8080/image.jpg');
    expect(result).toBe('jpg');
  });

  it('should handle subdomain URLs', () => {
    const result = getFileExtensionFromUrl('https://cdn.example.com/images/photo.webp');
    expect(result).toBe('webp');
  });

  it('should handle deep path URLs', () => {
    const result = getFileExtensionFromUrl('https://example.com/assets/images/gallery/photo.png');
    expect(result).toBe('png');
  });

  it('should handle encoded URLs', () => {
    const result = getFileExtensionFromUrl('https://example.com/images/%E5%9B%BE%E7%89%87.jpg');
    expect(result).toBe('jpg');
  });
});
