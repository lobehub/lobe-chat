import { createStyles } from '@lobehub/ui-rn';

export const useStyles = createStyles(({ token }) => ({
  // 空状态
  emptyContainer: {
    alignItems: 'center',
    padding: token.paddingXL,
  },

  emptyText: {
    color: token.colorTextTertiary,
    fontSize: token.fontSize,
    textAlign: 'center',
  },

  errorText: {
    color: token.colorError,
    fontSize: token.fontSize,
    textAlign: 'center',
  },

  footerComplete: {
    alignItems: 'center',
    paddingBlock: token.paddingSM,
  },

  footerCompleteText: {
    color: token.colorTextTertiary,
    fontSize: token.fontSize,
    fontStyle: 'italic',
  },

  // Footer样式 - 优雅的加载提示
  footerLoading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBlock: token.paddingLG,
  },

  footerText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    marginLeft: token.marginXS,
  },

  // 加载更多按钮
  loadMoreButton: {
    alignItems: 'center',
    backgroundColor: token.colorFillSecondary,
    borderRadius: token.borderRadius,
    marginHorizontal: token.padding,
    marginVertical: token.marginSM,
    paddingBlock: token.paddingSM,
  },

  loadMoreText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    fontWeight: '500',
  },

  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: token.paddingXL,
  },

  loadingText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    textAlign: 'center',
  },

  modelBottomRow: {
    alignSelf: 'flex-start',
  },

  // ModelCard样式
  modelCard: {
    paddingBlock: token.paddingSM,
    // backgroundColor: token.colorBgContainer,
    // borderBottomColor: token.colorBorderSecondary,
    // borderBottomWidth: 1,
    paddingInline: token.padding,
  },

  modelCardContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  modelIdTag: {
    // backgroundColor: token.colorFillTertiary,
    marginBottom: 0,
    marginLeft: 0,
  },

  modelIdText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    fontWeight: '500',
  },

  modelInfo: {
    flex: 1,
    paddingBlock: token.paddingSM,
    paddingInline: token.padding,
  },

  modelName: {
    color: token.colorText,
    flex: 1,
    fontSize: token.fontSize,
    fontWeight: '500',
  },

  modelSwitchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  modelTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    marginBottom: token.marginXS,
  },

  modelsActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
  },

  modelsCount: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
  },

  // Models相关样式（从ModelsSection迁移）
  modelsHeader: {
    // backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    marginBottom: token.marginSM,
    padding: token.padding,
  },

  modelsSearchInput: {
    // paddingBlock: 10,
  },

  modelsTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    marginBottom: token.marginXXS,
  },

  modelsTitleContainer: {
    flex: 1,
  },

  modelsTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: token.marginSM,
  },

  // Section header样式
  sectionHeader: {
    paddingBlock: token.paddingXS,
    // backgroundColor: token.colorFillQuaternary,
    paddingInline: token.padding,
  },

  sectionHeaderText: {
    color: token.colorText,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
  },
}));
