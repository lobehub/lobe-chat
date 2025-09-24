import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

type StyleObject = ViewStyle | TextStyle | ImageStyle;

// 基础配置类型
export interface VariantConfig<T extends Record<string, any> = Record<string, any>> {
  compoundVariants?: Array<
    Partial<T> & {
      style: StyleObject | StyleObject[];
    }
  >;
  defaultVariants?: Partial<T>;
  variants?: {
    [key in keyof T]?: {
      [value: string]: StyleObject | StyleObject[] | null;
    };
  };
}

// CVA 函数类型
export interface CVAFunction<T extends Record<string, any> = Record<string, any>> {
  (props?: Partial<T>): StyleObject[];
  config: VariantConfig<T>;
}

/**
 * 创建一个 React Native 版本的 Class Variance Authority
 * @param baseStyle 基础样式
 * @param config 变体配置
 * @returns 样式函数
 */
export function cva<T extends Record<string, any> = Record<string, any>>(
  baseStyle: StyleObject | StyleObject[] = {},
  config: VariantConfig<T> = {},
): CVAFunction<T> {
  const { variants = {}, compoundVariants = [], defaultVariants = {} } = config;

  const variantFunction = (props: Partial<T> = {}) => {
    // 合并默认值和传入的 props
    const mergedProps = { ...defaultVariants, ...props };

    // 开始构建样式数组
    const styles: StyleObject[] = [];

    // 添加基础样式
    if (Array.isArray(baseStyle)) {
      styles.push(...baseStyle);
    } else if (baseStyle) {
      styles.push(baseStyle);
    }

    // 添加变体样式
    Object.entries(variants as Record<string, any>).forEach(([variantKey, variantValues]) => {
      const propValue = mergedProps[variantKey as keyof T];
      if (propValue !== undefined && variantValues) {
        const variantStyle = variantValues[String(propValue)];
        if (variantStyle) {
          if (Array.isArray(variantStyle)) {
            styles.push(...variantStyle);
          } else {
            styles.push(variantStyle);
          }
        }
      }
    });

    // 添加复合变体样式
    compoundVariants.forEach((compound) => {
      const { style: compoundStyle, ...conditions } = compound;

      // 检查是否所有条件都匹配
      const isMatch = Object.entries(conditions).every(([key, value]) => {
        return mergedProps[key as keyof T] === value;
      });

      if (isMatch && compoundStyle) {
        if (Array.isArray(compoundStyle)) {
          styles.push(...compoundStyle);
        } else {
          styles.push(compoundStyle);
        }
      }
    });

    return styles;
  };

  // 添加配置到函数上，方便调试和扩展
  variantFunction.config = config;

  return variantFunction;
}

/**
 * 合并多个样式数组
 * @param styles 样式数组
 * @returns 合并后的样式对象
 */
export function mergeStyles(
  ...styles: (StyleObject | StyleObject[] | undefined | null)[]
): StyleObject {
  const merged: StyleObject = {};

  styles.forEach((style) => {
    if (!style) return;

    if (Array.isArray(style)) {
      style.forEach((s) => {
        if (s) {
          Object.assign(merged, s);
        }
      });
    } else {
      Object.assign(merged, style);
    }
  });

  return merged;
}

/**
 * 条件样式工具函数
 * @param condition 条件
 * @param trueStyle 条件为真时的样式
 * @param falseStyle 条件为假时的样式
 * @returns 样式对象或 null
 */
export function conditionalStyle(
  condition: boolean,
  trueStyle: StyleObject,
  falseStyle: StyleObject | null = null,
): StyleObject | null {
  return condition ? trueStyle : falseStyle;
}

/**
 * 创建响应式变体（基于不同的尺寸）
 * @param variants 尺寸变体对象
 * @param currentSize 当前尺寸
 * @returns 对应尺寸的样式
 */
export function responsiveVariant<T extends string>(
  variants: Record<T, StyleObject>,
  currentSize: T,
): StyleObject | null {
  return variants[currentSize] || null;
}
