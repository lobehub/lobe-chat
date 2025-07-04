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
 * Get file extension from URL
 *
 * This function extracts the file extension from a URL's pathname and validates it against
 * common image formats. It properly handles URLs with query parameters, hash fragments,
 * relative paths, and various edge cases. Returns empty string for invalid cases.
 *
 * @param url - The URL to extract extension from (can be relative, absolute, or include query parameters and hash fragments)
 * @returns file extension without dot (e.g., 'jpg', 'png', 'webp'), or empty string for invalid cases
 *
 * @example
 * ```typescript
 * inferFileExtensionFromImageUrl('https://example.com/image.jpg') // 'jpg'
 * inferFileExtensionFromImageUrl('https://example.com/image.png?v=123') // 'png'
 * inferFileExtensionFromImageUrl('https://example.com/image.webp#section') // 'webp'
 * inferFileExtensionFromImageUrl('generations/images/photo.png') // 'png'
 * inferFileExtensionFromImageUrl('https://example.com/document.txt') // '' (empty string)
 * inferFileExtensionFromImageUrl('invalid-url') // '' (empty string)
 * ```
 */
export const inferFileExtensionFromImageUrl = (url: string): string => {
  // Use a temporary base URL for proper URL parsing and formatting (handles relative paths)
  const tempBase = 'https://a.com';
  const urlObj = new URL(url, tempBase);
  const pathname = urlObj.pathname;

  // Find the last dot in the pathname to get the file extension
  const lastDotIndex = pathname.lastIndexOf('.');
  if (lastDotIndex === -1) return ''; // No extension found, return empty string

  // Extract extension after the last dot and convert to lowercase
  const extension = pathname.slice(Math.max(0, lastDotIndex + 1)).toLowerCase();

  // Validate against common image extensions
  const validImageExtensions = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'tiff', 'tif'];
  if (validImageExtensions.includes(extension)) {
    return extension;
  }

  // Default fallback for non-image extensions
  return '';
};

/**
 * Infer content type (MIME type) from an image URL
 *
 * This function extracts the file extension from a URL and returns the corresponding MIME type.
 * It properly handles URLs with query parameters, hash fragments, relative paths, and various edge cases.
 *
 * @param url - The image URL to analyze (can be relative, absolute, or include query parameters and hash fragments)
 * @returns MIME type string (e.g., 'image/jpeg', 'image/png')
 * @throws {Error} When the URL doesn't contain a valid file extension
 *
 * @example
 * ```typescript
 * inferContentTypeFromImageUrl('https://example.com/image.jpg') // 'image/jpeg'
 * inferContentTypeFromImageUrl('https://example.com/image.png?v=123') // 'image/png'
 * inferContentTypeFromImageUrl('https://example.com/image.webp#section') // 'image/webp'
 * inferContentTypeFromImageUrl('generations/images/photo.png') // 'image/png'
 * ```
 */
export function inferContentTypeFromImageUrl(url: string) {
  // Get the file extension using the dedicated function
  // inferFileExtensionFromImageUrl only returns valid image extensions or empty string
  const extension = inferFileExtensionFromImageUrl(url);

  // If no valid extension found, throw error
  if (!extension) {
    throw new Error(`Invalid image url: ${url}`);
  }

  // Get MIME type using the mime library
  // Since extension is guaranteed to be a valid image extension from the whitelist,
  // mime.getType() will always return a valid image MIME type
  const mimeType = mime.getType(extension);

  return mimeType!; // Non-null assertion is safe due to whitelist validation
}
