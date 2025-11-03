import { createStyles } from '@/components/styles';

export const useStyles = createStyles(() => ({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    // 基础样式，具体尺寸由组件逻辑计算
  },
}));
