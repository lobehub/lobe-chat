import { Generation } from '@/types/generation';

// 计算图片的显示尺寸，保持原图比例
export const calculateImageSize = (generation: Generation) => {
  const { asset } = generation;
  if (!asset?.width || !asset?.height) {
    // 如果没有尺寸信息，使用默认尺寸
    return { width: 200, height: 200 };
  }

  const maxHeight = 200; // 最大高度
  const aspectRatio = asset.width / asset.height;

  let width = maxHeight * aspectRatio;
  let height = maxHeight;

  // 如果宽度太大，限制宽度并调整高度
  const maxWidth = 300;
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
};
