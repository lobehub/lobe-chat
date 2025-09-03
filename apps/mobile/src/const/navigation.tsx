import { useThemeToken } from '@/theme';
import { StackAnimationTypes } from 'react-native-screens';

// 主题感知的导航栏配置
export const useThemedScreenOptions = () => {
  const token = useThemeToken();

  return {
    animation: 'slide_from_right' as StackAnimationTypes,
    headerShown: true,
    headerStyle: {
      backgroundColor: token.colorBgLayout,
      borderBottomWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTintColor: token.colorText,
    headerTitle: '',
    headerTitleAlign: 'center' as const,
    headerTitleStyle: {
      color: token.colorTextHeading,
      fontSize: 17,
      fontWeight: token.fontWeightStrong,
    },
  };
};
