import { createStyles } from '@/theme';

const PADDING_SIZE = 16;

export const useStyles = createStyles((token) => ({
  button: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusLG + PADDING_SIZE,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
}));
