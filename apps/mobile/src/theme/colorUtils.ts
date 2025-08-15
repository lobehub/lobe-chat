/**
 * Pure color and style utility functions
 * These functions have no React dependencies and can be safely imported anywhere
 */

/**
 * 颜色工具类
 * 参考 Ant Design 的颜色算法
 */

// 颜色解析函数
export function parseColor(color: string): { a: number; b: number; g: number; r: number } {
  // 处理 rgba 格式
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    return {
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
      b: parseInt(rgbaMatch[3], 10),
      g: parseInt(rgbaMatch[2], 10),
      r: parseInt(rgbaMatch[1], 10),
    };
  }

  // 处理 hex 格式
  const hexMatch = color.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return {
        a: 1,
        b: parseInt(hex[2] + hex[2], 16),
        g: parseInt(hex[1] + hex[1], 16),
        r: parseInt(hex[0] + hex[0], 16),
      };
    } else {
      return {
        a: 1,
        b: parseInt(hex.slice(4, 6), 16),
        g: parseInt(hex.slice(2, 4), 16),
        r: parseInt(hex.slice(0, 2), 16),
      };
    }
  }

  // 默认返回透明色
  return { a: 0, b: 0, g: 0, r: 0 };
}

// 颜色转换为 rgba 字符串
export function toRgbaString(r: number, g: number, b: number, a: number = 1): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

const toHex = (n: number) => {
  const hex = Math.round(n).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

// 颜色转换为 hex 字符串
export function toHexString(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 设置颜色透明度
export function setAlpha(color: string, alpha: number): string {
  const { r, g, b } = parseColor(color);
  return toRgbaString(r, g, b, alpha);
}

// 获取带透明度的颜色
export function getAlphaColor(baseColor: string, alpha: number): string {
  const { r, g, b } = parseColor(baseColor);
  return toRgbaString(r, g, b, alpha);
}

// 颜色亮度调整
export function adjustBrightness(color: string, amount: number): string {
  const { r, g, b, a } = parseColor(color);

  const adjust = (value: number) => {
    return Math.max(0, Math.min(255, value + amount * 255));
  };

  return toRgbaString(adjust(r), adjust(g), adjust(b), a);
}
