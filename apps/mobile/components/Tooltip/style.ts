import { createStyles } from '@/mobile/theme';

export const useStyles = createStyles((token) => ({
  arrow: {
    borderRadius: token.borderRadiusXS,
    position: 'absolute',

    zIndex: -1,
  },
  container: {
    position: 'relative',
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  overlayTouchable: {
    flex: 1,
  },
  tooltip: {
    borderRadius: token.borderRadius,
    maxWidth: 250,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  tooltipText: {
    color: token.colorBgBase,
    fontSize: token.fontSizeSM,
    lineHeight: token.fontSizeSM * token.lineHeightSM,
  },
}));
