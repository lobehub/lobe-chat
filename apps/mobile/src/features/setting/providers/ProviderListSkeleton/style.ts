import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgContainer,
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  sectionSeparator: {
    height: token.marginSM,
  },
  sectionTitle: {
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
  },
}));
