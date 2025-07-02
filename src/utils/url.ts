import mime from 'mime';

/**
 * Build a path string from a path and a hash/search object
 *
 * This function constructs a properly formatted URL path by combining a base path
 * with optional hash and search parameters. It uses URL constructor for proper
 * encoding and formatting while removing the temporary base domain.
 *
 * @param path - The base path (can be relative, absolute, or include protocol)
 * @param options - Optional configuration object
 * @param options.hash - Hash fragment to append (with or without leading #)
 * @param options.search - Search/query parameters to append (with or without leading ?)
 * @returns Formatted path string with hash and search parameters
 *
 * @example
 * ```typescript
 * pathString('/home') // '/home'
 * pathString('/home', { search: 'id=1&name=test' }) // '/home?id=1&name=test'
 * pathString('/home', { hash: 'top' }) // '/home#top'
 * pathString('./home') // '/home'
 * pathString('https://example.com/path') // 'https://example.com/path'
 * ```
 */
export const pathString = (
  path: string,
  {
    hash = '',
    search = '',
  }: {
    hash?: string;
    search?: string;
  } = {},
) => {
  // Use a temporary base URL for proper URL parsing and formatting
  const tempBase = 'https://a.com';
  const url = new URL(path, tempBase);

  // Add hash fragment if provided
  if (hash) url.hash = hash;
  // Add search parameters if provided
  if (search) url.search = search;

  // Return the formatted URL without the temporary base
  return url.toString().replace(tempBase, '');
};

/**
 * Infer content type (MIME type) from an image URL
 *
 * This function extracts the file extension from a URL and returns the corresponding MIME type.
 * It properly handles URLs with query parameters, hash fragments, and various edge cases.
 *
 * @param url - The image URL to analyze (can include query parameters and hash fragments)
 * @returns MIME type string (e.g., 'image/jpeg', 'image/png')
 * @throws {Error} When the URL doesn't contain a valid file extension
 *
 * @example
 * ```typescript
 * inferContentTypeFromImageUrl('https://example.com/image.jpg') // 'image/jpeg'
 * inferContentTypeFromImageUrl('https://example.com/image.png?v=123') // 'image/png'
 * inferContentTypeFromImageUrl('https://example.com/image.webp#section') // 'image/webp'
 * ```
 */
export function inferContentTypeFromImageUrl(url: string) {
  try {
    // Handle protocol-relative URLs by adding https: prefix
    const normalizedUrl = url.startsWith('//') ? `https:${url}` : url;

    // Use URL constructor to properly parse the URL and extract pathname
    const urlObj = new URL(normalizedUrl);
    const pathname = urlObj.pathname;

    // Find the last dot in the pathname to get the file extension
    const lastDotIndex = pathname.lastIndexOf('.');
    if (lastDotIndex === -1) {
      throw new Error(`Invalid image url: ${url}`);
    }

    // Extract extension after the last dot
    const extension = pathname.slice(lastDotIndex + 1).toLowerCase();
    if (!extension) {
      throw new Error(`Invalid image url: ${url}`);
    }

    // Get MIME type using the mime library
    const mimeType = mime.getType(extension);
    if (!mimeType) {
      throw new Error(`Invalid image url: ${url}`);
    }

    // Verify that the MIME type is actually an image type
    if (!mimeType.startsWith('image/')) {
      throw new Error(`Invalid image url: ${url}`);
    }

    return mimeType;
  } catch (error) {
    // If URL parsing fails or any other error occurs, throw with original URL
    if (error instanceof Error && error.message.includes('Invalid image url')) {
      throw error;
    }
    throw new Error(`Invalid image url: ${url}`);
  }
}

/**
 * Get file extension from URL
 *
 * This function extracts the file extension from a URL's pathname and validates it against
 * common image formats. It properly handles URLs with query parameters, hash fragments,
 * and various edge cases. Unlike inferContentTypeFromImageUrl, this function is more
 * lenient and returns a default value for invalid cases.
 *
 * @param url - The URL to extract extension from (can include query parameters and hash fragments)
 * @returns file extension without dot (e.g., 'jpg', 'png', 'webp'), or 'png' as default fallback
 *
 * @example
 * ```typescript
 * getFileExtensionFromUrl('https://example.com/image.jpg') // 'jpg'
 * getFileExtensionFromUrl('https://example.com/image.png?v=123') // 'png'
 * getFileExtensionFromUrl('https://example.com/image.webp#section') // 'webp'
 * getFileExtensionFromUrl('https://example.com/document.txt') // 'png' (fallback)
 * getFileExtensionFromUrl('invalid-url') // 'png' (fallback)
 * ```
 */
export const getFileExtensionFromUrl = (url: string): string => {
  try {
    // Parse URL to extract pathname, which excludes query parameters and hash
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Find the last dot in the pathname to get the file extension
    const lastDotIndex = pathname.lastIndexOf('.');
    if (lastDotIndex === -1) return 'png'; // No extension found, return default

    // Extract extension after the last dot and convert to lowercase
    const extension = pathname.slice(Math.max(0, lastDotIndex + 1)).toLowerCase();

    // Validate against common image extensions
    const validImageExtensions = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'tiff', 'tif'];
    if (validImageExtensions.includes(extension)) {
      return extension;
    }
  } catch {
    // URL parsing failed or any other error occurred, fall through to default
  }

  // Default fallback for invalid URLs or non-image extensions
  return 'png';
};
