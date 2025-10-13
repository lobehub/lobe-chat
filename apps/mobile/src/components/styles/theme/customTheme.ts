/**
 * 直接从 @lobehub/ui 导入自定义主题相关定义
 * 避免重复实现，确保与 UI 包一致
 */
export {
  findCustomThemeName,
  type NeutralColors,
  neutralColors,
  type NeutralColorsObj,
  neutralColorsSwatches,
  type PrimaryColors,
  primaryColors,
  type PrimaryColorsObj,
  primaryColorsSwatches,
} from '@lobehub/ui/es/styles/customTheme';
