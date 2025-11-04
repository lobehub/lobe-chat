import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  // AES-GCM 相关样式
  aesGcmContainer: {
    alignItems: 'flex-start',
  },

  aesGcmContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: token.marginXXS,
    maxWidth: '100%',
  },

  aesGcmLink: {
    color: token.colorLink,
    textDecorationLine: 'underline',
  },

  aesGcmText: {
    color: token.colorTextQuaternary,
    flexShrink: 1,
    fontSize: token.fontSize,
    textAlign: 'left',
  },

  // Bottom Sheet styles
  bottomSheetBackground: {
    backgroundColor: token.colorBgElevated,
  },

  bottomSheetHandle: {
    backgroundColor: token.colorBorder,
  },

  // Checker 相关样式
  checkButton: {
    alignItems: 'center',
    backgroundColor: token.colorPrimary,
    borderRadius: token.borderRadius,
    height: 40,
    justifyContent: 'center',
    minWidth: 80,
    paddingInline: token.padding,
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
    marginVertical: token.marginXS,
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
    fontFamily: token.fontFamilyCode,
    fontSize: token.fontSize,
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
    fontSize: token.fontSize,
  },

  // 错误文字
  errorText: {
    color: token.colorError,
    fontSize: token.fontSize,
    marginTop: token.marginXXS,
  },

  // 输入框容器错误状态
  inputContainerError: {
    borderColor: token.colorError,
  },

  // 输入描述文字
  inputDescription: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
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

  // 加载指示器
  loadingIndicator: {
    position: 'absolute',
    right: token.paddingSM,
    top: '50%',
    transform: [{ translateY: -8 }], // 居中对齐
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
    height: 64, // Fixed height for FlashList optimization (56 + 8 padding)
    justifyContent: 'space-between',
    marginHorizontal: token.padding,
    marginVertical: token.marginXXS,
    paddingInline: token.paddingSM,
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
    paddingBottom: token.paddingSM,
  },

  modalTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
  },

  modelSelector: {
    alignItems: 'center',
    borderColor: token.colorBorder,
    borderRadius: token.borderRadius,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: token.controlHeightLG,
    justifyContent: 'space-between',
    paddingInline: token.paddingSM,
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
    fontSize: token.fontSize,
  },

  // 文本输入框
  textInput: {},

  textInputDisabled: {
    color: token.colorTextDisabled,
    opacity: 0.6,
  },

  // 更新状态指示器
  updatingIndicator: {
    color: token.colorTextTertiary,
    fontSize: token.fontSize,
    marginTop: token.marginXS,
    textAlign: 'center',
  },
}));
