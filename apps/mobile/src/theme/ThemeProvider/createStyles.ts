import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

import { useThemeToken, useTheme } from './context';
import { AliasToken } from '../interface';

// 定义样式类型
export type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

// StyleCreator 类型，接收token和自定义参数，返回样式对象
type StyleCreator<T, P extends any[] = []> = (token: AliasToken, ...customParams: P) => T;

/**
 * 创建样式钩子
 * 类似于 antd-style 的 createStyles 方法，但简化为只使用 React Native StyleSheet
 * @param creator 样式创建函数，接收 token 和用户参数
 * @returns 返回 useStyles 钩子函数
 */
export const createStyles = <T extends NamedStyles<T>, P extends any[] = []>(
  creator: StyleCreator<T, P>,
) => {
  // 返回一个hook函数，自动推断参数类型
  return (...customParams: P) => {
    const token = useThemeToken();
    const { theme } = useTheme();

    // 使用 useMemo 缓存样式对象，避免重新渲染
    const styles = useMemo(() => {
      const rawStyles = creator(token, ...customParams);
      // StyleSheet.create 会自动保留样式对象的类型
      return StyleSheet.create(rawStyles);
    }, [token, ...customParams]);

    return {
      styles,
      theme,
      token,
    };
  };
};
