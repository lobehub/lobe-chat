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
    ...token.boxShadowCard,
    overflow: 'hidden',
    padding: token.padding,
  },

  // 最外层容器
  container: {
    paddingHorizontal: token.padding,
  },

  // 描述文字 - 对标web端colorTextDescription
  description: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    lineHeight: token.lineHeightSM,
    marginBottom: token.marginSM,
    minHeight: 44, // 对标web端最小高度
  },

  // 分割线 - 对标web端Divider
  divider: {
    backgroundColor: token.colorBorderSecondary,
    height: 1,
    marginBottom: token.marginSM,
    marginHorizontal: -token.padding, // 延伸到卡片边缘
    marginTop: token.marginXXS,
  },

  // 顶部：Logo + 标题
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: token.marginSM,
  },

  // Loading容器 - 固定宽度避免布局跳跃
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: token.marginXS,
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
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
  },
}));
