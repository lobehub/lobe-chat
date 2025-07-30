/**
 * Legacy utils file - now redirects to new organized files
 * This file maintains backward compatibility while the codebase transitions
 *
 * New organization:
 * - Pure utility functions: ./colorUtils.ts
 * - React hook utilities: ./hooks.ts
 */

// Re-export pure utilities from colorUtils
export {
  adjustBrightness,
  createThemedStyle,
  generateColorPalette,
  generateNeutralColorPalette,
  generateRadius,
  getAlphaColor,
  getFontSizes,
  getLineHeight,
  mixColor,
  parseColor,
  setAlpha,
  toHexString,
  toRgbaString,
} from './colorUtils';

// Re-export hook utilities from hooks
export { useThemeUtils } from './hooks';
