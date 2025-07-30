import { createStyles } from '@/mobile/theme/createStyles';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,

    borderTopLeftRadius: token.borderRadiusLG * 4,

    // 24
    borderTopRightRadius: token.borderRadiusLG * 4,
    borderWidth: 1,
    elevation: 8,

    paddingHorizontal: token.padding,

    paddingVertical: token.paddingSM,
    // 24
    shadowColor: token.colorText,
    shadowOffset: { height: -4, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  extraBtn: {
    flexShrink: 0,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: token.marginXS,
    width: '100%',
  },
  iconGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  input: {
    borderRadius: token.borderRadius,
    color: token.colorText,
    flex: 1,
    fontSize: token.fontSizeLG,
    lineHeight: 24,
    maxHeight: 96,
    paddingVertical: token.paddingXS,
  },
  inputArea: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftActions: {},
  rightActions: {},
}));
