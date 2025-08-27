import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  sectionHeader: {
    marginTop: token.marginSM,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  sectionHeaderText: {
    fontSize: token.fontSizeSM,
    fontWeight: '600',
  },
}));
