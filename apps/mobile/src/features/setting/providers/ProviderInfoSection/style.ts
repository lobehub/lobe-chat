import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  // 主容器
  container: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    padding: token.padding,
  },

  // 描述文字
  description: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    lineHeight: token.lineHeightSM,
    marginTop: token.marginXS,
  },

  // 头部区域
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
    width: 24,
  },

  // Logo容器
  logoContainer: {
    alignItems: 'flex-start',
    marginRight: token.marginSM,
  },

  // 副标题
  subtitle: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    marginTop: 2,
  },

  // Switch容器
  switchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  // 主标题
  title: {
    color: token.colorText,
    fontSize: 18,
    fontWeight: token.fontWeightStrong,
  },

  // 标题容器
  titleContainer: {
    flex: 1,
  },
}));
