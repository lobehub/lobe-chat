import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  badge: {
    backgroundColor: token.colorError,
    borderRadius: token.borderRadiusXS,
    height: 8,
    marginRight: token.marginXS,
    width: 8,
  },
  checkmark: {},
  customContent: {
    backgroundColor: token.colorBgContainer,
    paddingBottom: token.paddingMD,
    paddingHorizontal: token.paddingMD,
  },
  separator: {
    backgroundColor: token.colorBorderSecondary,
    height: 1,
    marginHorizontal: token.marginMD,
  },
  settingItem: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: token.paddingMD,
    paddingVertical: token.paddingSM,
  },
  settingItemArrow: {
    color: token.colorBorder,
    fontSize: token.fontSizeIcon,
    marginLeft: token.marginSM,
  },
  settingItemDescription: {
    color: token.colorTextDescription,
    fontSize: token.fontSizeSM,
    marginTop: token.marginXS,
  },
  settingItemExtra: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    marginRight: token.marginXXS,
  },
  settingItemLeft: {
    flexDirection: 'column',
    flexShrink: 1,
    justifyContent: 'center',
  },
  settingItemRight: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  settingItemTitle: {
    color: token.colorText,
    fontSize: token.fontSize,
  },
}));
