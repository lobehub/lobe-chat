import { HEADER_HEIGHT } from '@/const/common';
import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  header: {
    alignItems: 'center',
    backgroundColor: token.colorBgLayout,
    flexDirection: 'row',
    height: HEADER_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: token.paddingXS,
    zIndex: 10,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    maxWidth: '100%',
  },
  title: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    textAlign: 'left',
  },
}));
