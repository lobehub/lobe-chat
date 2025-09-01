/**
 * Detect if text contains Chinese characters
 * @param text - The text to check
 * @returns true if text contains Chinese characters, false otherwise
 */
export const containsChinese = (text: string): boolean => {
  return /[\u4E00-\u9FA5]/.test(text);
};
