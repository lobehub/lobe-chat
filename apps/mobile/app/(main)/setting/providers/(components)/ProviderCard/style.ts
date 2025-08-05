import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  // 底部操作区域
  actionArea: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // 卡片容器 - 对标web端
  card: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1, // Android阴影
    overflow: 'hidden',
    padding: 16,
    shadowColor: token.colorTextQuaternary,
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  // 最外层容器
  container: {
    paddingHorizontal: 16,
  },

  // 描述文字 - 对标web端colorTextDescription
  description: {
    color: token.colorTextSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    minHeight: 44, // 对标web端最小高度
  },

  // 分割线 - 对标web端Divider
  divider: {
    backgroundColor: token.colorBorderSecondary,
    height: 1,
    marginBottom: 12,
    marginHorizontal: -16, // 延伸到卡片边缘
    marginTop: 4,
  },

  // 顶部：Logo + 标题
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // Loading容器 - 固定宽度避免布局跳跃
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    width: 24, // 固定宽度，适配18px的ActivityIndicator + 一些边距
  },

  // 占位元素，确保Switch右对齐
  spacer: {
    flex: 1,
  },

  // Switch容器
  switchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  // 标题文字
  title: {
    color: token.colorText,
    fontSize: 16,
    fontWeight: 'bold',
  },
}));
