import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  backdrop: {
    backgroundColor: token.colorBgMask,
  },
  closeButton: {
    position: 'absolute' as const,
    right: 12,
    top: 12,
    zIndex: 10,
  },
  container: {
    backgroundColor: token.colorBgContainer,
    borderTopLeftRadius: token.borderRadiusLG * 2,
    borderTopRightRadius: token.borderRadiusLG * 2,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingBlock: token.padding,
    paddingInline: token.paddingLG,
  },
  handle: {
    alignSelf: 'center' as const,
    backgroundColor: token.colorBorder,
    borderRadius: 2,
    height: 4,
    marginTop: token.marginSM,
    width: 32,
  },
  handleIndicator: {
    backgroundColor: token.colorBorder,
  },
  header: {
    alignItems: 'center' as const,
    borderBottomColor: token.colorBorderSecondary,
    borderBottomWidth: 1,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    minHeight: 56,
    paddingBlock: token.padding,
    paddingInline: token.paddingLG,
  },
  headerWithCloseButton: {
    paddingRight: 48,
  },
  title: {
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
  titleText: {
    color: token.colorTextHeading,
    fontSize: token.fontSizeLG,
  },
}));
