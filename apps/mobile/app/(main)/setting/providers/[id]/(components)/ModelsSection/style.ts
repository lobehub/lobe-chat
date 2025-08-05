import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  // 操作按钮容器
  actionsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // 卡片内容
  cardContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  // 主容器
  container: {
    backgroundColor: token.colorBgContainer,
    borderRadius: 8,
    overflow: 'hidden',
  },

  // 空状态容器
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },

  // 空状态文字
  emptyText: {
    color: token.colorTextTertiary,
    fontSize: 14,
    textAlign: 'center',
  },

  // 获取按钮
  fetchButton: {
    alignItems: 'center',
    backgroundColor: token.colorPrimary,
    borderRadius: 6,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  // 获取按钮禁用状态
  fetchButtonDisabled: {
    backgroundColor: token.colorFillSecondary,
  },

  // 获取按钮文字
  fetchButtonText: {
    color: token.colorWhite,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // 获取按钮文字禁用状态
  fetchButtonTextDisabled: {
    color: token.colorTextTertiary,
  },

  // 头部
  header: {
    padding: 16,
  },

  // Loading容器 - 固定宽度避免布局跳跃
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    width: 20,
  },

  // Loading容器（页面级）
  loadingContainerPage: {
    alignItems: 'center',
    padding: 32,
  },

  // Loading文字
  loadingText: {
    color: token.colorTextSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },

  // 模型数量
  modelCount: {
    color: token.colorTextSecondary,
    fontSize: 12,
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
    fontSize: 12,
    fontWeight: '500',
  },

  // 模型信息
  modelInfo: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // 模型元信息
  modelMeta: {
    color: token.colorTextSecondary,
    fontSize: 12,
    lineHeight: 16,
  },

  // 模型名称
  modelName: {
    color: token.colorText,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },

  // 搜索容器
  searchContainer: {
    alignItems: 'center',
    backgroundColor: token.colorBgLayout,
    borderColor: token.colorBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 12,
  },

  // 搜索输入框
  searchInput: {
    color: token.colorText,
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    paddingVertical: 10,
  },

  // 分组头部
  sectionHeader: {
    backgroundColor: token.colorFillQuaternary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // 分组头部文字
  sectionHeaderText: {
    color: token.colorText,
    fontSize: 14,
    fontWeight: '600',
  },

  // 章节标题
  sectionTitle: {
    color: token.colorText,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
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
    marginBottom: 12,
  },

  // 顶部行（显示名称 + 能力图标）
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
}));
