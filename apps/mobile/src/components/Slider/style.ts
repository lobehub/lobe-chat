import { createStyles } from '@/theme';

export const TRACK_HEIGHT = 4;
export const BORDER_WIDTH = 2;

export const DOT_SIZE = 8 + 2 * BORDER_WIDTH;

export const useStyles = createStyles((token, { disabled }: { disabled: boolean }) => ({
  activeTrack: {
    backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorPrimaryBorder,
    borderRadius: token.borderRadiusSM,
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
  },
  container: {
    minHeight: token.sizeXXL, // Ensure enough space for labels
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingSM,
  },

  markDot: {
    backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorBgElevated,
    borderColor: disabled ? token.colorBorder : token.colorBorderSecondary,
    borderRadius: DOT_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    height: DOT_SIZE,
    marginTop: (TRACK_HEIGHT - DOT_SIZE) / 2,
    width: DOT_SIZE,
  },

  // marks styles
  markItem: {
    alignItems: 'center',
    height: '100%',
    position: 'absolute',
    top: 0,
  },

  markLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: token.margin,
    minHeight: token.fontSizeLG,
  },
  markLabelText: {
    color: token.colorText,
    fontSize: token.fontSizeSM,
  },
  thumb: {
    backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorBgElevated,
    borderColor: disabled ? token.colorBorder : token.colorPrimary,
    borderRadius: token.controlHeightLG / 4,
    borderWidth: BORDER_WIDTH,
    height: token.controlHeightLG / 2,
    marginLeft: -token.controlHeightLG / 4,
    marginTop: -token.controlHeightLG / 4 + BORDER_WIDTH,
    position: 'absolute',
    ...token.boxShadowSecondary,
    top: 0,
    width: token.controlHeightLG / 2,
  },
  track: {
    backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorFillTertiary,
    borderRadius: token.borderRadiusSM,
    height: TRACK_HEIGHT,
    position: 'relative',
    width: '100%',
  },
}));
