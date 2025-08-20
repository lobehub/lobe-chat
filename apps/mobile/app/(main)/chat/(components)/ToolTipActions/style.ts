import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  actionIcon: {
    color: token.colorBgContainer,
  },
  actionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXS,
  },
  actionLabel: {
    color: token.colorBgContainer,
    fontSize: token.fontSizeSM,
    fontWeight: token.fontWeightStrong,
    marginTop: token.marginXXS,
    textAlign: 'center',
  },
  actionLabelSuccess: {
    color: token.colorSuccess,
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: token.marginXS,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: token.marginSM,
    justifyContent: 'space-around',
  },
  tooltipOverlay: {
    borderRadius: token.borderRadius,
    minWidth: 180,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  touchableWrapper: {
    borderRadius: token.borderRadius,
  },
}));
