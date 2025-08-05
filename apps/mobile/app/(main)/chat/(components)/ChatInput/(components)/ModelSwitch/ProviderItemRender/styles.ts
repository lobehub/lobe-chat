import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },

  customIcon: {
    // 应用灰度滤镜，类似Web端的 filter: 'grayscale(1)'
    // React Native 中可以通过 tintColor 实现类似效果
    opacity: 0.7,
  },

  icon: {
    height: 20,
    width: 20,
  },

  name: {
    color: token.colorTextSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
}));
