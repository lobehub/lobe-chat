import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  // 操作按钮相关样式
  actionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    width: '100%',
  },

  addButton: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  addButtonText: {
    color: token.colorText,
    fontSize: 16,
    fontWeight: '500',
  },

  authorAvatar: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    marginRight: 6,
    width: 24,
  },

  avatarTitleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },

  // 头部相关样式
  backButton: {
    padding: 8,
  },

  // 容器相关样式
  container: {
    flex: 1,
    padding: 20,
  },

  description: {
    color: token.colorText,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
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
    fontSize: 16,
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
    marginTop: 16,
  },

  safeAreaContainer: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },

  scrollContainer: {
    flex: 1,
  },

  settingsIcon: {
    fontSize: 18,
  },

  settingsTitleContainer: {
    alignItems: 'center',
    backgroundColor: token.colorBgElevated,
    borderTopLeftRadius: token.borderRadiusLG,
    borderTopRightRadius: token.borderRadiusLG,
    flexDirection: 'row',
    padding: 16,
  },

  shareButton: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },

  // 系统角色相关样式
  systemRoleContainer: {
    backgroundColor: token.colorBgContainer,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },

  systemRoleContentContainer: {
    // paddingVertical: 12,
    color: token.colorText,

    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 16,
  },

  systemRoleTitle: {
    color: token.colorText,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // 标签相关样式
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    marginLeft: -4,
  },
}));
