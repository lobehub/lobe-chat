import { StyleSheet } from 'react-native';

import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token }) => ({
  horizontal: {
    backgroundColor: token.colorBorder,
    height: StyleSheet.hairlineWidth,
  },
  vertical: {
    backgroundColor: token.colorBorder,
    width: StyleSheet.hairlineWidth,
  },
}));
