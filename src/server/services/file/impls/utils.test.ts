import { describe, expect, it, vi } from 'vitest';

import { extractKeyFromUrlOrReturnOriginal } from './utils';

describe('extractKeyFromUrlOrReturnOriginal', () => {
  const mockGetKeyFromFullUrl = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('URL detection', () => {
    it('should detect https:// URLs and extract key', () => {
      const httpsUrl = 'https://s3.example.com/bucket/path/to/file.jpg';
      const expectedKey = 'path/to/file.jpg';
      
      mockGetKeyFromFullUrl.mockReturnValue(expectedKey);
      
      const result = extractKeyFromUrlOrReturnOriginal(httpsUrl, mockGetKeyFromFullUrl);
      
      expect(mockGetKeyFromFullUrl).toHaveBeenCalledWith(httpsUrl);
      expect(result).toBe(expectedKey);
    });

    it('should detect http:// URLs and extract key', () => {
      const httpUrl = 'http://s3.example.com/bucket/path/to/file.jpg';
      const expectedKey = 'path/to/file.jpg';
      
      mockGetKeyFromFullUrl.mockReturnValue(expectedKey);
      
      const result = extractKeyFromUrlOrReturnOriginal(httpUrl, mockGetKeyFromFullUrl);
      
      expect(mockGetKeyFromFullUrl).toHaveBeenCalledWith(httpUrl);
      expect(result).toBe(expectedKey);
    });

    it('should handle presigned URLs with query parameters', () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.jpg?X-Amz-Signature=abc&X-Amz-Expires=3600';
      const expectedKey = 'file.jpg';
      
      mockGetKeyFromFullUrl.mockReturnValue(expectedKey);
      
      const result = extractKeyFromUrlOrReturnOriginal(presignedUrl, mockGetKeyFromFullUrl);
      
      expect(mockGetKeyFromFullUrl).toHaveBeenCalledWith(presignedUrl);
      expect(result).toBe(expectedKey);
    });
  });

  describe('key passthrough', () => {
    it('should return original string for plain keys', () => {
      const key = 'path/to/file.jpg';
      
      const result = extractKeyFromUrlOrReturnOriginal(key, mockGetKeyFromFullUrl);
      
      expect(mockGetKeyFromFullUrl).not.toHaveBeenCalled();
      expect(result).toBe(key);
    });

    it('should return original string for desktop:// keys', () => {
      const desktopKey = 'desktop://documents/file.pdf';
      
      const result = extractKeyFromUrlOrReturnOriginal(desktopKey, mockGetKeyFromFullUrl);
      
      expect(mockGetKeyFromFullUrl).not.toHaveBeenCalled();
      expect(result).toBe(desktopKey);
    });

    it('should return original string for relative paths', () => {
      const relativePath = './assets/image.png';
      
      const result = extractKeyFromUrlOrReturnOriginal(relativePath, mockGetKeyFromFullUrl);
      
      expect(mockGetKeyFromFullUrl).not.toHaveBeenCalled();
      expect(result).toBe(relativePath);
    });

    it('should return original string for file:// protocol', () => {
      const fileUrl = 'file:///Users/test/file.txt';
      
      const result = extractKeyFromUrlOrReturnOriginal(fileUrl, mockGetKeyFromFullUrl);
      
      expect(mockGetKeyFromFullUrl).not.toHaveBeenCalled();
      expect(result).toBe(fileUrl);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const emptyString = '';
      
      const result = extractKeyFromUrlOrReturnOriginal(emptyString, mockGetKeyFromFullUrl);
      
      expect(mockGetKeyFromFullUrl).not.toHaveBeenCalled();
      expect(result).toBe(emptyString);
    });

    it('should handle strings that start with http but are not URLs', () => {
      const notUrl = 'httpish-string';
      
      const result = extractKeyFromUrlOrReturnOriginal(notUrl, mockGetKeyFromFullUrl);
      
      expect(mockGetKeyFromFullUrl).not.toHaveBeenCalled();
      expect(result).toBe(notUrl);
    });

    it('should handle case sensitivity correctly', () => {
      const upperCaseHttps = 'HTTPS://example.com/file.jpg';
      
      const result = extractKeyFromUrlOrReturnOriginal(upperCaseHttps, mockGetKeyFromFullUrl);
      
      expect(mockGetKeyFromFullUrl).not.toHaveBeenCalled();
      expect(result).toBe(upperCaseHttps);
    });
  });

  describe('legacy bug scenarios', () => {
    it('should handle S3 public URLs', () => {
      const s3PublicUrl = 'https://mybucket.s3.amazonaws.com/images/photo.jpg';
      const expectedKey = 'images/photo.jpg';
      
      mockGetKeyFromFullUrl.mockReturnValue(expectedKey);
      
      const result = extractKeyFromUrlOrReturnOriginal(s3PublicUrl, mockGetKeyFromFullUrl);
      
      expect(mockGetKeyFromFullUrl).toHaveBeenCalledWith(s3PublicUrl);
      expect(result).toBe(expectedKey);
    });

    it('should handle custom domain S3 URLs', () => {
      const customDomainUrl = 'https://cdn.example.com/files/document.pdf';
      const expectedKey = 'files/document.pdf';
      
      mockGetKeyFromFullUrl.mockReturnValue(expectedKey);
      
      const result = extractKeyFromUrlOrReturnOriginal(customDomainUrl, mockGetKeyFromFullUrl);
      
      expect(mockGetKeyFromFullUrl).toHaveBeenCalledWith(customDomainUrl);
      expect(result).toBe(expectedKey);
    });

    it('should handle local development URLs', () => {
      const localUrl = 'http://localhost:3000/desktop-file/images/screenshot.png';
      const expectedKey = 'desktop://images/screenshot.png';
      
      mockGetKeyFromFullUrl.mockReturnValue(expectedKey);
      
      const result = extractKeyFromUrlOrReturnOriginal(localUrl, mockGetKeyFromFullUrl);
      
      expect(mockGetKeyFromFullUrl).toHaveBeenCalledWith(localUrl);
      expect(result).toBe(expectedKey);
    });
  });
});