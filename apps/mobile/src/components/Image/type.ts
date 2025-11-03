import type { ImageProps as ExpoImageProps } from 'expo-image';
import type { ReactNode } from 'react';

import type { BlockProps } from '../Block';

export interface ImageProps extends ExpoImageProps, Pick<BlockProps, 'variant' | 'borderRadius'> {
  autoSize?: boolean;

  /**
   * 图片加载失败时的占位图
   * 可以是 base64 编码的图片字符串
   * 如果不指定，会根据当前主题自动使用亮色或暗色占位图
   */
  fallback?: string;

  /**
   * 图片高度
   * 可以是数字（像素）或字符串（如 '100%'）
   * 优先级高于 style 中的 height
   */
  height?: number | string;

  /**
   * 容器最大宽度（用于自适应计算）
   * 如果不指定，默认使用窗口宽度
   */
  maxWidth?: number;

  /**
   * 是否启用预览功能
   * @default true
   */
  preview?: boolean;

  /**
   * 自定义预览时使用的图片 URL（如果与显示的图片不同）
   */
  previewSrc?: string;

  /**
   * 图片宽度
   * 可以是数字（像素）或字符串（如 '100%'）
   * 优先级高于 style 中的 width
   */
  width?: number | string;
}

/**
 * PreviewGroup 组件属性
 */
export interface PreviewGroupProps {
  /**
   * 子组件
   */
  children: ReactNode;

  /**
   * 是否禁用预览
   * @default false
   */
  preview?: boolean;
}

/**
 * PreviewGroup Context 值
 */
export interface PreviewGroupContextValue {
  /**
   * 是否在 PreviewGroup 中
   */
  inGroup: boolean;

  /**
   * 是否启用预览
   */
  preview: boolean;

  /**
   * 注册图片
   */
  registerImage: (url: string) => number;

  /**
   * 显示预览
   */
  showPreview: (index: number) => void;

  /**
   * 注销图片
   */
  unregisterImage: (index: number) => void;
}
