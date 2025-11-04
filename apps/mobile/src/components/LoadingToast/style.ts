import { StyleSheet } from 'react-native';

import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  cancelButton: {
    borderColor: token.colorBorder,
    borderWidth: 1,
    padding: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastContainer: {
    minHeight: 120,
    minWidth: 120,
  },
}));
