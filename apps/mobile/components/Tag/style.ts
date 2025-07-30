import { createStyles } from '@/mobile/theme';

export const useStyles = createStyles((token) => ({
  tag: {
    backgroundColor: token.colorFillQuaternary,
    borderRadius: 4,
    marginBottom: 4,
    marginLeft: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: token.colorTextSecondary,
    fontSize: 12,
  },
}));
