import { HEADER_HEIGHT } from '@/const/common';
import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  actionButton: {
    backgroundColor: 'transparent',
    borderRadius: token.borderRadiusXS,
    padding: token.paddingXXS,
  },
  header: {
    alignItems: 'center',
    backgroundColor: token.colorBgLayout,
    flexDirection: 'row',
    height: HEADER_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: token.paddingSM,
    zIndex: 10,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: token.paddingXS,
  },
  headerInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    maxWidth: '100%',
  },
  headerSubtitle: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    marginTop: 2,
    maxWidth: '100%',
    textAlign: 'left',
  },
  headerText: {
    alignItems: 'flex-start',
    flex: 1,
  },
  headerTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    textAlign: 'left',
  },
}));
