/**
 * 解析比例字符串，例如 "16:9" -> 1.777
 * @param ratio - 格式为 "width:height" 的比例字符串
 * @returns 比例数值，出现错误时返回 1:1 比例
 */
export function parseRatio(ratio: string): number {
  if (!ratio || typeof ratio !== 'string') return 1;

  const parts = ratio.split(':');
  if (parts.length !== 2) return 1;

  const [widthStr, heightStr] = parts;
  const width = Number(widthStr);
  const height = Number(heightStr);

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return 1;
  }

  return width / height;
}

/**
 * 根据目标比例和默认尺寸，计算最合适的尺寸
 * @param ratio - 目标宽高比例
 * @param defaultWidth - 默认宽度
 * @param defaultHeight - 默认高度
 * @returns 计算出的尺寸对象
 */
export function adaptSizeToRatio(ratio: number, defaultWidth: number, defaultHeight: number) {
  // 验证输入参数
  if (!Number.isFinite(ratio) || ratio <= 0) {
    throw new Error('Invalid ratio: must be a positive finite number');
  }
  if (!Number.isFinite(defaultWidth) || defaultWidth <= 0) {
    throw new Error('Invalid defaultWidth: must be a positive finite number');
  }
  if (!Number.isFinite(defaultHeight) || defaultHeight <= 0) {
    throw new Error('Invalid defaultHeight: must be a positive finite number');
  }

  const currentRatio = defaultWidth / defaultHeight;

  if (ratio > currentRatio) {
    // 目标比例更宽，保持宽度，调整高度
    return { width: defaultWidth, height: Math.round(defaultWidth / ratio) };
  } else {
    // 目标比例更高，保持高度，调整宽度
    return { width: Math.round(defaultHeight * ratio), height: defaultHeight };
  }
}
