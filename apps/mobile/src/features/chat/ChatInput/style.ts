import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    borderTopLeftRadius: token.borderRadiusLG * 4,
    borderTopRightRadius: token.borderRadiusLG * 4,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
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
    flex: 1,
    maxHeight: 96,
  },
  inputArea: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  rightActions: {},
}));
