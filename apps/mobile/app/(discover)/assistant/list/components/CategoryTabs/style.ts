import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    flexDirection: 'row',
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: token.colorFillSecondary,
    borderRadius: token.borderRadiusSM,
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: token.paddingXXS,
    paddingVertical: 1,
  },
  countBadgeActive: {
    backgroundColor: token.colorBgMask,
  },
  countText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    fontWeight: '500',
    lineHeight: token.fontSizeSM + 2,
  },
  countTextActive: {
    color: token.colorTextLightSolid,
  },
  tab: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    marginRight: token.marginXS,
    paddingHorizontal: token.paddingLG,
    paddingVertical: token.paddingXS,
  },
  tabActive: {
    backgroundColor: token.colorPrimary,
  },
  tabContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXXS,
  },
  tabText: {
    color: token.colorText,
    fontSize: token.fontSize,
    textTransform: 'capitalize',
  },
  tabTextActive: {
    color: token.colorTextLightSolid,
  },
}));
