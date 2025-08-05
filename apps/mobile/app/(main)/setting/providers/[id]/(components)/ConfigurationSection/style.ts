import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  // 主容器
  container: {
    backgroundColor: token.colorBgContainer,
    borderRadius: 8,
    padding: 16,
  },

  // 错误文字
  errorText: {
    color: token.colorError,
    fontSize: 12,
    marginTop: 4,
  },

  // 眼睛按钮
  eyeButton: {
    padding: 12,
  },

  // 输入框容器
  inputContainer: {
    alignItems: 'center',
    backgroundColor: token.colorBgLayout,
    borderColor: token.colorBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
  },

  // 输入框容器错误状态
  inputContainerError: {
    borderColor: token.colorError,
  },

  // 输入描述文字
  inputDescription: {
    color: token.colorTextSecondary,
    fontSize: 12,
    marginBottom: 12,
  },

  // 输入组容器
  inputGroup: {
    marginBottom: 20,
  },

  // 输入标签
  inputLabel: {
    color: token.colorText,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  // 章节标题
  sectionTitle: {
    color: token.colorText,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },

  // 文本输入框
  textInput: {
    color: token.colorText,
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  // 更新状态指示器
  updatingIndicator: {
    color: token.colorTextTertiary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
}));
