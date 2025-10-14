import { useTheme } from '@lobehub/ui-rn';
import { StackAnimationTypes } from 'react-native-screens';

// 主题感知的导航栏配置
export const useThemedScreenOptions = () => {
  const theme = useTheme();

  return {
    animation: 'slide_from_right' as StackAnimationTypes,
    contentStyle: {
      backgroundColor: theme.colorBgLayout,
    },
    headerShown: false,
  };
};
