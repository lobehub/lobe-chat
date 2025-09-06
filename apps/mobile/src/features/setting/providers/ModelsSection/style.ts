import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  // 操作按钮容器
  actionsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
  },

  // 底部行（模型ID标签）
  bottomRow: {
    alignSelf: 'flex-start',
  },

  // 卡片
  card: {
    backgroundColor: token.colorBgContainer,
    borderBottomColor: token.colorBorderSecondary,
    borderBottomWidth: 1,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },

  // 卡片内容
  cardContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  // 主容器
  container: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    overflow: 'hidden',
  },

  // 空状态容器
  emptyContainer: {
    alignItems: 'center',
    padding: token.paddingXL,
  },

  // 空状态文字
  emptyText: {
    color: token.colorTextTertiary,
    fontSize: token.fontSize,
    textAlign: 'center',
  },

  // 获取按钮
  fetchButton: {
    alignItems: 'center',
    backgroundColor: token.colorPrimary,
    borderRadius: token.borderRadius,
    flexDirection: 'row',
    paddingHorizontal: token.paddingSM,
    paddingVertical: 6,
  },

  // 获取按钮禁用状态
  fetchButtonDisabled: {
    backgroundColor: token.colorFillSecondary,
  },

  // 获取按钮文字
  fetchButtonText: {
    color: token.colorTextLightSolid,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
    marginLeft: token.marginXXS,
  },

  // 获取按钮文字禁用状态
  fetchButtonTextDisabled: {
    color: token.colorTextTertiary,
  },

  // 头部
  header: {
    padding: token.padding,
  },

  // Loading容器 - 固定宽度避免布局跳跃
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: token.marginXS,
    width: 20,
  },

  // Loading容器（页面级）
  loadingContainerPage: {
    alignItems: 'center',
    padding: token.paddingXL,
  },

  // Loading文字
  loadingText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    marginTop: token.marginXS,
    textAlign: 'center',
  },

  // 模型数量
  modelCount: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
  },

  // 模型ID标签
  modelIdTag: {
    backgroundColor: token.colorFillTertiary,
    marginBottom: 0,
    marginLeft: 0,
  },

  // 模型ID文字
  modelIdText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    fontWeight: '500',
  },

  // 模型信息
  modelInfo: {
    flex: 1,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },

  // 模型元信息
  modelMeta: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    lineHeight: 16,
  },

  // 模型名称
  modelName: {
    color: token.colorText,
    flex: 1,
    fontSize: token.fontSize,
    fontWeight: '500',
  },

  // 搜索输入框
  searchInput: {
    marginBottom: token.margin,
    paddingHorizontal: token.paddingSM,
  },

  // 分组头部
  sectionHeader: {
    backgroundColor: token.colorFillQuaternary,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingXS,
  },

  // 分组头部文字
  sectionHeaderText: {
    color: token.colorText,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
  },

  // 章节标题
  sectionTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    marginBottom: token.marginXXS,
  },

  // Switch容器
  switchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  // 标题容器
  titleContainer: {
    flex: 1,
  },

  // 标题行
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: token.marginSM,
  },

  // 顶部行（显示名称 + 能力图标）
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    marginBottom: token.marginXS,
  },
}));
