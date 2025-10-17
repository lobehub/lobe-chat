import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    alignItems: 'flex-start' as const,
    flex: 1,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },

  emojiCell: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  emojiText: {
    color: token.colorText,
  },

  frame: {
    flex: 1,
    width: '100%' as const,
  },

  loader: {
    alignItems: 'center' as const,
    flex: 1,
    justifyContent: 'center' as const,
  },

  scrollview: {
    flex: 1,
  },

  sectionHeader: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeLG,
    margin: token.marginXS,
    width: '100%' as const,
  },
}));
