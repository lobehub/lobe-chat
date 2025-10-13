export function getLineHeight(fontSize: number) {
  // RN 直接写像素值更常见，倍数需要修改为字符串，不方便计算
  return (fontSize + 8) / fontSize;
}

// https://zhuanlan.zhihu.com/p/32746810
export default function getFontSizes(base: number) {
  const fontSizes = Array.from({ length: 10 }).map((_, index) => {
    const i = index - 1;
    const baseSize = base * Math.E ** (i / 5);
    const intSize = index > 1 ? Math.floor(baseSize) : Math.ceil(baseSize);

    // Convert to even
    return Math.floor(intSize / 2) * 2;
  });

  fontSizes[1] = base;

  return fontSizes.map((size) => ({
    lineHeight: getLineHeight(size) * size,
    size,
  }));
}
