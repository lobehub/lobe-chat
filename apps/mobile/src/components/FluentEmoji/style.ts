import { createStyles } from '@/theme/createStyles';

/**
 * 创建 FluentEmoji 组件样式
 * @param size 表情符号尺寸
 * @returns StyleSheet 样式对象
 */
export const useStyles = createStyles((token, size: number = 32) => ({
  container: {
    alignItems: 'center',
    height: size,
    justifyContent: 'center',
    width: size,
  },
}));
