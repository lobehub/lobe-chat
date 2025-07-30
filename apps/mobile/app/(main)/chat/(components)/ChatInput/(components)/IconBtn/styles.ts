import { ViewStyle } from 'react-native';

import { createStyles } from '@/mobile/theme';

const PADDING_SIZE = 16;

export const useStyles = createStyles((token) => ({
  buttonBase: {
    alignItems: 'center',
    backgroundColor: token.colorBgElevated,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusLG + PADDING_SIZE,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: token.paddingXS,
  } as ViewStyle,

  buttonPrimary: {
    backgroundColor: token.colorBgSolidActive,
    borderColor: token.colorPrimaryText,
  } as ViewStyle,
}));

export const getButtonSize = (size: number) => ({
  height: size + PADDING_SIZE,
  width: size + PADDING_SIZE,
});
