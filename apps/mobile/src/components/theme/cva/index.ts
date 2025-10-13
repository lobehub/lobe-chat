import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

type StyleObject = ViewStyle | TextStyle | ImageStyle;

// 变体定义：每个变体键下是一个值到样式的映射
export type VariantDefinitions = Record<string, Record<string, StyleProp<any> | null>>;

// 由变体定义推导的 props：
// - 允许使用各变体的值键（例如 'filled' | 'outlined'）
// - 同时放宽为 boolean/number，便于布尔型变体直接传 true/false
export type VariantProps<TVariants extends VariantDefinitions> = {
  [K in keyof TVariants]?: keyof TVariants[K] | boolean | number;
};

// 基础配置类型（从 variants 的键推导 compoundVariants 和 defaultVariants 的键）
export interface VariantConfig<TVariants extends VariantDefinitions = VariantDefinitions> {
  compoundVariants?: Array<
    Partial<{ [K in keyof TVariants]: keyof TVariants[K] | boolean | number }> & {
      style: StyleProp<any>;
    }
  >;
  defaultVariants?: Partial<{ [K in keyof TVariants]: keyof TVariants[K] | boolean | number }>;

  variants?: TVariants;
}

export interface CVAFunction<TProps extends Record<string, unknown> = Record<string, unknown>> {
  (props?: Partial<TProps>): StyleProp<any>;
  config: VariantConfig<any>;
}

export function cva<TVariants extends VariantDefinitions>(
  baseStyle: StyleProp<any>,
  config?: VariantConfig<TVariants>,
): CVAFunction<VariantProps<TVariants>> {
  const {
    variants = {} as TVariants,
    compoundVariants = [],
    defaultVariants = {} as Partial<{
      [K in keyof TVariants]: keyof TVariants[K] | boolean | number;
    }>,
  } = (config ?? {}) as VariantConfig<TVariants>;

  const variantFunction = (props: Partial<VariantProps<TVariants>> = {}) => {
    // 合并默认值和传入的 props
    const mergedProps: Record<string, unknown> = { ...defaultVariants, ...props };

    // 开始构建样式数组
    const styles: StyleObject[] = [];

    // 添加基础样式
    if (Array.isArray(baseStyle)) {
      styles.push(...baseStyle);
    } else if (baseStyle) {
      styles.push(baseStyle);
    }

    // 添加变体样式
    Object.entries(variants as Record<string, Record<string, StyleProp<any> | null>>).forEach(
      ([variantKey, variantValues]) => {
        const propValue = mergedProps[variantKey];
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
      },
    );

    // 添加复合变体样式
    (
      compoundVariants as Array<
        Partial<Record<string, string | number | boolean>> & { style: StyleProp<any> }
      >
    ).forEach((compound) => {
      const { style: compoundStyle, ...conditions } = compound as {
        [k: string]: unknown;
        style?: StyleProp<any>;
      };

      // 检查是否所有条件都匹配
      const isMatch = Object.entries(conditions).every(([key, value]) => {
        return mergedProps[key] === value;
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
  variantFunction.config = (config ?? {}) as VariantConfig<TVariants>;

  return variantFunction;
}

/**
 * 合并多个样式数组
 * @param styles 样式数组
 * @returns 合并后的样式对象
 */
export function mergeStyles(...styles: StyleProp<any>[]): StyleProp<any>[] {
  return styles;
}
