import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  // AES-GCM 相关样式
  aesGcmContainer: {
    alignItems: 'center',
    paddingVertical: token.paddingSM,
  },

  aesGcmContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
  },

  aesGcmLink: {
    color: token.colorLink,
    textDecorationLine: 'underline',
  },

  aesGcmText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    opacity: 0.66,
    textAlign: 'center',
  },

  // Checker 相关样式
  checkButton: {
    alignItems: 'center',
    backgroundColor: token.colorPrimary,
    borderRadius: token.borderRadius,
    height: 40,
    justifyContent: 'center',
    minWidth: 80,
    paddingHorizontal: token.padding,
  },

  checkButtonDisabled: {
    backgroundColor: token.colorFillSecondary,
    opacity: 0.6,
  },

  checkButtonText: {
    color: token.colorTextLightSolid,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
  },

  checkerContainer: {
    gap: token.marginSM,
  },

  checkerRow: {
    flexDirection: 'row',
    gap: token.marginSM,
  },

  // 主容器
  container: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    padding: token.padding,
  },

  // Error display styles
  errorContainer: {
    backgroundColor: token.colorErrorBg,
    borderColor: token.colorErrorBorder,
    borderRadius: token.borderRadius,
    borderWidth: 1,
    marginTop: token.marginSM,
    padding: token.paddingSM,
  },

  errorDetails: {
    marginTop: token.marginSM,
    maxHeight: 200,
  },

  errorDetailsText: {
    color: token.colorTextSecondary,
    fontFamily: 'monospace',
    fontSize: token.fontSizeSM,
  },

  errorHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  errorMainContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: token.marginXS,
  },

  errorMessage: {
    color: token.colorError,
    flex: 1,
    fontSize: token.fontSizeSM,
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

  modalContent: {
    backgroundColor: token.colorBgElevated,
    borderTopLeftRadius: token.borderRadiusLG,
    borderTopRightRadius: token.borderRadiusLG,
    maxHeight: '50%',
    paddingBottom: 20,
  },

  modalHeader: {
    alignItems: 'center',
    borderBottomColor: token.colorBorder,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: token.padding,
  },

  modalItem: {
    alignItems: 'center',
    borderRadius: token.borderRadius,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: token.marginXS,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingSM,
  },

  modalItemContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: token.marginXS,
  },

  modalItemSelected: {
    backgroundColor: token.colorPrimaryBg,
  },

  modalItemText: {
    color: token.colorText,
    fontSize: token.fontSize,
  },

  modalItemTextSelected: {
    color: token.colorPrimary,
    fontWeight: token.fontWeightStrong,
  },

  modalList: {
    paddingHorizontal: token.padding,
  },

  // Modal styles
  modalOverlay: {
    backgroundColor: token.colorBgMask,
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
  },

  modelSelector: {
    alignItems: 'center',
    backgroundColor: token.colorBgLayout,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadius,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 40,
    justifyContent: 'space-between',
    paddingHorizontal: token.paddingSM,
  },

  modelSelectorContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: token.marginXS,
  },

  modelSelectorDisabled: {
    backgroundColor: token.colorBgContainerDisabled,
    opacity: 0.6,
  },

  modelSelectorIcon: {
    marginLeft: token.marginXS,
  },

  modelSelectorText: {
    color: token.colorText,
    flex: 1,
    fontSize: token.fontSize,
  },

  modelSelectorTextDisabled: {
    color: token.colorTextDisabled,
  },

  // 章节标题
  sectionTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    marginBottom: token.margin,
  },

  statusContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    marginTop: token.marginSM,
  },

  statusText: {
    fontSize: token.fontSizeSM,
  },

  // 文本输入框
  textInput: {
    color: token.colorText,
    flex: 1,
    fontSize: token.fontSize,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingSM,
  },

  textInputDisabled: {
    color: token.colorTextDisabled,
    opacity: 0.6,
  },

  // 更新状态指示器
  updatingIndicator: {
    color: token.colorTextTertiary,
    fontSize: token.fontSizeSM,
    marginTop: token.marginXS,
    textAlign: 'center',
  },
}));
