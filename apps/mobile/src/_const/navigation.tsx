import { useTheme } from '@lobehub/ui-rn';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

// 主题感知的导航栏配置
export const useThemedScreenOptions = (animation: boolean = true) => {
  const theme = useTheme();

  return {
    animation: animation
      ? Platform.select({
          ios: 'slide_from_right' as StackAnimationTypes,
        })
      : undefined,
    contentStyle: {
      backgroundColor: theme.colorBgLayout,
    },
    headerShown: false,
  };
};
