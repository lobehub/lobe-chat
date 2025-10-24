import { Platform } from 'react-native';

import { InputSize } from '@/components';
import { getInputSizeStyles } from '@/components/Input/style';
import { createStyles } from '@/components/styles';

interface UseStylesProps {
  size?: InputSize;
}

export const useStyles = createStyles(({ token }, { size = 'middle' }: UseStylesProps) => {
  const sizeStyles = getInputSizeStyles(token, size);
  return {
    input: {
      color: token.colorText,
      fontFamily: token.fontFamily,
      fontSize: sizeStyles.fontSize,
      minHeight: sizeStyles.controlHeight * 1.25,
      paddingBlock: sizeStyles.paddingInline * 1.25,
      paddingHorizontal: sizeStyles.paddingInline * 1.25,
      paddingVertical: sizeStyles.paddingInline * 1.25,
      textAlignVertical: 'center',
      ...(Platform.OS === 'android' && {
        includeFontPadding: false,
        lineHeight: sizeStyles.fontSize * 1.6,
        margin: 0,
        paddingBlock: 0,
      }),
    },
  };
});
