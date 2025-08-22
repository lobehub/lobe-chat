import { ColorValue, ImageStyle, TextStyle, ViewStyle } from 'react-native';

import { Renderers } from '../renderers';

export type CodeBlockStyle = {
  contentBackgroundColor?: ColorValue;
  contentTextStyle?: TextStyle;
  headerBackgroundColor?: ColorValue;
  headerTextStyle?: TextStyle;
};

export interface Styles {
  blockquote: ViewStyle;
  borderColor: ColorValue;
  break: TextStyle;
  codeBlock: CodeBlockStyle;
  container: ViewStyle;
  delete: TextStyle;
  emphasis: TextStyle;
  footnoteReference: TextStyle;
  heading: (level: number) => TextStyle;
  image: ImageStyle;
  inlineCode: TextStyle;
  link: TextStyle;
  linkReference: TextStyle;
  list: ViewStyle;
  listItem: ViewStyle;
  paragraph: TextStyle;
  strong: TextStyle;
  tableCell: TextStyle;
  text: TextStyle;
  thematicBreak: ViewStyle;
}

export interface Theme {
  dark?: Partial<Styles>;
  global?: Partial<Styles>;
  light?: Partial<Styles>;
  renderers?: Partial<Renderers>;
}

function isObject<T>(obj: T): obj is T & object {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
}

export function deepMerge<T>(target: T, source: T): T {
  const result = { ...target };
  for (const key in source) {
    if (isObject(source[key]) && isObject(result[key])) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export const mergeStyles = <T extends ViewStyle | TextStyle | CodeBlockStyle | ImageStyle>(
  ...styles: (T | undefined)[]
): T => {
  let result: T = {} as T;
  for (const style of styles) {
    if (style) {
      result = deepMerge(result, style);
    }
  }
  return result;
};
