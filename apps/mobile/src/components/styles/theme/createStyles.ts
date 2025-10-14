import { useMemo } from 'react';
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';

import {
  type AliasToken,
  type LobeStylish,
  generateStylish,
  mergeStyles,
} from '@/components/styles';

import { useTheme, useThemeMode } from '../../ThemeProvider/context';

// 定义样式类型
export type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

// 样式创建函数的参数类型
interface StyleCreatorParams {
  cx: typeof mergeStyles;
  isDarkMode: boolean;
  stylish: LobeStylish;
  token: AliasToken;
}

// StyleCreator 类型，接收包含所有参数的对象
type StyleCreatorFunction<T, P extends any[] = []> = (
  params: StyleCreatorParams,
  ...customParams: P
) => T;

/**
 * 创建样式钩子
 * 类似于 antd-style 的 createStyles 方法，使用对象参数形式
 * 使用方式：createStyles(({ token, stylish, isDarkMode, theme }) => ({ ... }))
 * @param creator 样式创建函数，接收包含 token、stylish、isDarkMode、theme 的对象
 * @returns 返回 useStyles 钩子函数
 */
export const createStyles = <T extends NamedStyles<T> | NamedStyles<any>, P extends any[] = []>(
  creator: StyleCreatorFunction<T, P>,
) => {
  // 返回一个hook函数，自动推断参数类型
  return (...customParams: P) => {
    const theme = useTheme();
    const { isDarkMode } = useThemeMode();

    // 生成 stylish 对象
    const stylish = useMemo(() => {
      return generateStylish(theme, isDarkMode);
    }, [theme, isDarkMode]);

    // 使用 useMemo 缓存样式对象，避免重新渲染
    const styles = useMemo(() => {
      // 传递对象参数，包含所有必要的属性
      const params: StyleCreatorParams = {
        cx: mergeStyles,
        isDarkMode,
        stylish,
        token: theme,
      };

      const rawStyles = creator(params, ...customParams);

      // StyleSheet.create 会自动保留样式对象的类型
      return StyleSheet.create(rawStyles);
    }, [theme, stylish, isDarkMode, ...customParams]);

    return useMemo(
      () => ({
        cx: mergeStyles,
        styles,
        stylish,
        theme,
      }),
      [styles, stylish, theme],
    );
  };
};
