import { StackAnimationTypes } from 'react-native-screens';

// 主题感知的导航栏配置
export const useThemedScreenOptions = () => {
  return {
    animation: 'slide_from_right' as StackAnimationTypes,
    headerShown: false,
  };
};
