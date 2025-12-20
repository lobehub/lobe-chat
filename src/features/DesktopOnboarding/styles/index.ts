// 统一导出所有样式模块
// 导出一个组合的样式 hook，用于需要多个样式模块的场景
import { useLayoutStyles } from './layout';
import { useMediaStyles } from './media';
import { useSpacingStyles } from './spacing';
import { useTypographyStyles } from './typography';

export { useLayoutStyles } from './layout';
export { useMediaStyles } from './media';
export { useSpacingStyles } from './spacing';
export { customTheme } from './theme';
export { useTypographyStyles } from './typography';

export const useCommonStyles = () => {
  const layout = useLayoutStyles();
  const typography = useTypographyStyles();
  const spacing = useSpacingStyles();
  const media = useMediaStyles();

  return {
    layout,
    media,
    spacing,
    typography,
  };
};
