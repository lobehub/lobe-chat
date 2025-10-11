import { createStyles } from '@/theme';

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
    paddingVertical: token.paddingSM,
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
    paddingVertical: token.paddingLG,
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
    paddingVertical: token.paddingSM,
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
    // backgroundColor: token.colorBgContainer,
    // borderBottomColor: token.colorBorderSecondary,
    // borderBottomWidth: 1,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
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
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
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
    // paddingVertical: 10,
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

  scrollContainer: {
    paddingHorizontal: token.paddingContentHorizontal,
    paddingTop: token.paddingContentVertical,
  },

  // Section header样式
  sectionHeader: {
    // backgroundColor: token.colorFillQuaternary,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingXS,
  },

  sectionHeaderText: {
    color: token.colorText,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
  },
}));
