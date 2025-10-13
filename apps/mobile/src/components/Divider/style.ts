import { StyleSheet } from 'react-native';

import { createStyles } from '@/components/theme';

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
