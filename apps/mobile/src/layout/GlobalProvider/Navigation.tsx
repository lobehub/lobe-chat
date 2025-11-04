import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useTheme } from '@lobehub/ui-rn';
import { PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

/**
 * Navigation Provider
 * - GestureHandlerRootView: Gesture handling support
 * - BottomSheetModalProvider: Bottom sheet modal support
 * Note: Stack navigation is defined in _layout.tsx
 */
const Navigation = ({ children }: PropsWithChildren) => {
  const theme = useTheme();

  return (
    <GestureHandlerRootView style={{ backgroundColor: theme.colorBgLayout, flex: 1 }}>
      <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default Navigation;
