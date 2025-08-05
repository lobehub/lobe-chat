import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  // 主容器
  container: {
    backgroundColor: token.colorBgContainer,
    borderRadius: 8,
    padding: 16,
  },

  // 描述文字
  description: {
    color: token.colorTextSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  // 头部区域
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
    width: 24,
  },

  // Logo容器
  logoContainer: {
    alignItems: 'flex-start',
    marginRight: 12,
  },

  // 副标题
  subtitle: {
    color: token.colorTextSecondary,
    fontSize: 12,
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
    fontWeight: 'bold',
  },

  // 标题容器
  titleContainer: {
    flex: 1,
  },
}));
