import { ICON_SIZE_SMALL } from '@/const/common';
import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXXS,
  },

  customIcon: {
    // 应用灰度滤镜，类似Web端的 filter: 'grayscale(1)'
    // React Native 中可以通过 tintColor 实现类似效果
    opacity: 0.7,
  },

  icon: {
    height: ICON_SIZE_SMALL,
    width: ICON_SIZE_SMALL,
  },

  name: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
  },
}));
