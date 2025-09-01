import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  // 主容器
  container: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    padding: token.padding,
  },

  // 错误文字
  errorText: {
    color: token.colorError,
    fontSize: token.fontSizeSM,
    marginTop: token.marginXXS,
  },

  // 眼睛按钮
  eyeButton: {
    padding: token.paddingSM,
  },

  // 输入框容器
  inputContainer: {
    alignItems: 'center',
    backgroundColor: token.colorBgLayout,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusLG,
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
    fontSize: token.fontSizeSM,
    marginBottom: token.marginSM,
  },

  // 输入组容器
  inputGroup: {
    marginBottom: token.marginMD,
  },

  // 输入标签
  inputLabel: {
    color: token.colorText,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
    marginBottom: token.marginXS,
  },

  // 章节标题
  sectionTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    marginBottom: token.margin,
  },

  // 文本输入框
  textInput: {
    color: token.colorText,
    flex: 1,
    fontSize: token.fontSize,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingSM,
  },

  // 更新状态指示器
  updatingIndicator: {
    color: token.colorTextTertiary,
    fontSize: token.fontSizeSM,
    marginTop: token.marginXS,
    textAlign: 'center',
  },
}));
