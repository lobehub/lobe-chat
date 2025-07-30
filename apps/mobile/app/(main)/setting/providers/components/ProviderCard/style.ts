import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  body: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  desc: {
    color: token.colorTextSecondary,
    opacity: 0.5,
  },
  divider: {
    backgroundColor: '#333',
    height: 12,
    width: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    color: token.colorText,
    fontSize: 16,
    fontWeight: 'bold',
  },
}));
