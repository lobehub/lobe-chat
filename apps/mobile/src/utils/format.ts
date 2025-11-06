/**
 * Format file size from bytes to human readable format
 * @param bytes - File size in bytes
 * @param fractionDigits - Number of decimal places (default: 1)
 * @returns Formatted string like "1.5 MB"
 */
export const formatSize = (bytes?: number, fractionDigits: number = 1): string => {
  if (!bytes && bytes !== 0) return '--';

  const kbSize = bytes / 1024;
  if (kbSize < 1024) {
    return `${kbSize.toFixed(fractionDigits)} KB`;
  } else if (kbSize < 1_048_576) {
    const mbSize = kbSize / 1024;
    return `${mbSize.toFixed(fractionDigits)} MB`;
  } else {
    const gbSize = kbSize / 1_048_576;
    return `${gbSize.toFixed(fractionDigits)} GB`;
  }
};
