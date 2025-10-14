import { StyleSheet } from 'react-native';

import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  horizontal: {
    backgroundColor: token.colorFill,
    height: StyleSheet.hairlineWidth,
  },
  vertical: {
    backgroundColor: token.colorFill,
    width: StyleSheet.hairlineWidth,
  },
}));
