import { createStyles } from '@lobehub/ui-rn';

export const useStyles = createStyles(({ token }) => ({
  // 操作按钮相关样式
  actionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: token.marginLG,
    width: '100%',
  },

  addButton: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: token.marginXS,
    paddingBlock: token.paddingSM,
    paddingInline: token.margin,
  },

  addButtonText: {
    color: token.colorText,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
  },

  authorAvatar: {
    alignItems: 'center',
    borderRadius: token.borderRadiusSM,
    height: token.controlHeightSM,
    justifyContent: 'center',
    marginRight: token.marginXS / 2,
    width: token.controlHeightSM,
  },

  avatarTitleContainer: {
    alignItems: 'center',
    marginBottom: token.margin,
  },

  // 头部相关样式
  backButton: {
    padding: token.marginXS,
  },

  // 容器相关样式
  container: {
    flex: 1,
    padding: token.padding,
  },

  description: {
    color: token.colorText,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    marginBottom: token.margin,
  },

  errorContainer: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    flex: 1,
    justifyContent: 'center',
  },

  errorText: {
    color: token.colorError,
  },

  iconText: {
    fontSize: token.fontSize,
  },

  loadingContainer: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    flex: 1,
    justifyContent: 'center',
  },

  // 文字相关样式
  loadingText: {
    color: token.colorTextSecondary,
    marginTop: token.margin,
  },

  scrollContainer: {
    flex: 1,
  },

  settingsIcon: {
    fontSize: token.fontSizeLG,
  },

  settingsTitleContainer: {
    alignItems: 'center',
    backgroundColor: token.colorBgElevated,
    borderTopLeftRadius: token.borderRadiusLG,
    borderTopRightRadius: token.borderRadiusLG,
    flexDirection: 'row',
    padding: token.margin,
  },

  shareButton: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    height: token.controlHeight,
    justifyContent: 'center',
    width: token.controlHeight,
  },

  // 系统角色相关样式
  systemRoleContainer: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    marginBottom: token.marginLG,
    width: '100%',
  },

  systemRoleContentContainer: {
    // paddingBlock: 12,
    color: token.colorText,

    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeight,
    paddingInline: token.margin,
  },

  systemRoleTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    marginLeft: token.marginXS,
  },
  // 标签相关样式
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: token.marginXXS,
    marginBottom: token.marginLG,
  },
}));
