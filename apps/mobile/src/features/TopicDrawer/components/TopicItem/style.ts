import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  activeContainer: {
    backgroundColor: token.colorPrimaryBg,
    borderColor: token.colorPrimary,
    borderWidth: 1,
  },

  activeTitle: {
    color: token.colorText,
  },

  container: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 12,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  content: {
    flex: 1,
  },

  title: {
    color: token.colorText,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
}));
