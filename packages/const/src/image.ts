/**
 * 默认宽高比，当模型不支持原生宽高比时使用
 */
export const DEFAULT_ASPECT_RATIO = '1:1';

export const PRESET_ASPECT_RATIOS = [
  DEFAULT_ASPECT_RATIO, // '1:1' - 正方形，最常用
  '16:9', // 现代显示器/电视/视频标准
  '9:16', // 手机竖屏/短视频
  '4:3', // 传统显示器/照片
  '3:4', // 传统竖屏照片
  '3:2', // 经典照片比例横屏
  '2:3', // 经典照片比例竖屏
];
