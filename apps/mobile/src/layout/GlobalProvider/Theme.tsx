import { ThemeProvider } from '@lobehub/ui-rn';
import { PropsWithChildren } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';

/**
 * Theme and Keyboard Provider
 * - ThemeProvider: Theme context for UI components
 * - KeyboardProvider: Keyboard handling and awareness
 */
const Theme = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <KeyboardProvider>{children}</KeyboardProvider>
    </ThemeProvider>
  );
};

export default Theme;
