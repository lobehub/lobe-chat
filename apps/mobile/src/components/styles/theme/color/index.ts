/**
 * 从 @lobehub/ui 的具体模块路径导入颜色定义
 * 避免加载整个包（包括 Web 组件如 EmojiPicker），只加载纯数据
 */
export * from '@lobehub/ui/es/color/colors';
export * from '@lobehub/ui/es/color/neutrals';
export { type ColorScaleItem } from '@lobehub/ui/es/color/types';
