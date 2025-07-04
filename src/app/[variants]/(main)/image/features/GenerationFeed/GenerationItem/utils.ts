import { Generation } from '@/types/generation';

// 计算图片的宽高比，用于设置容器的 aspect-ratio
export const getAspectRatio = (asset: Generation['asset']) => {
  if (!asset?.width || !asset?.height) {
    // 如果没有尺寸信息，使用 1:1 比例
    return '1 / 1';
  }

  return `${asset.width} / ${asset.height}`;
};
