import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  // Button 组件自带样式，这些不再需要

  container: {
    alignSelf: 'stretch',
    marginTop: token.marginLG,
    width: '100%',
  },

  editActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
  },

  editButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
  },

  editButtonText: {
    color: token.colorTextLightSolid,
    fontSize: token.fontSizeSM,
    fontWeight: '500',
  },

  editContainer: {
    marginHorizontal: token.paddingLG,
    marginTop: token.marginMD,
    paddingBottom: token.paddingLG,
  },

  emptyText: {
    color: token.colorTextTertiary,
    fontSize: token.fontSize,
    fontStyle: 'italic',
    padding: token.paddingSM,
    textAlign: 'left',
  },

  markdownWrapper: {
    // 不使用 flex: 1，让内容自然撑开
    // 可选：设置最大高度以防内容过长
    // maxHeight: 300,
  },

  previewContainer: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    marginHorizontal: token.paddingLG,
    marginTop: token.marginMD,
    minHeight: 120,
    padding: token.paddingSM,
  },

  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingInline: token.paddingLG,
    paddingTop: token.paddingLG,
    width: '100%',
  },

  sectionTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: '600',
  },

  statsContainer: {
    marginHorizontal: token.paddingLG,
    marginTop: token.marginXS,
    paddingBottom: token.paddingMD,
    paddingTop: token.paddingXS,
  },

  statsText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    textAlign: 'right',
  },

  textInput: {
    backgroundColor: token.colorBgElevated,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadius,
    borderWidth: 1,
    color: token.colorText,
    fontSize: token.fontSize,
    minHeight: 150,
    padding: token.padding,
    textAlignVertical: 'top',
  },
}));
