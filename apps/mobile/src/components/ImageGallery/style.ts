import { Platform, StyleSheet } from 'react-native';

import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.5)' : '#000000',
  },
  downloadButton: {
    position: 'absolute',
    right: 8, // 与 PageContainer 的 paddingInline 一致
    zIndex: 100,
  },
  imageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  indicator: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    // bottom 通过 insets.bottom + 40 动态设置
    justifyContent: 'center',
    minWidth: 60,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'absolute',
  },
  indicatorText: {
    color: '#FFFFFF',
    fontFamily: token.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
}));
