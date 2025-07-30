import { createStyles } from '@/mobile/theme';

export const useStyles = createStyles(
  (
    token,
    {
      size,
      backgroundColor = '',
    }: {
      backgroundColor?: string;
      size: number;
    },
  ) => ({
    avatar: {
      alignItems: 'center',
      backgroundColor: backgroundColor,
      borderRadius: size / 2,
      height: size,

      justifyContent: 'center',

      // 圆形头像
      overflow: 'hidden',

      width: size,
    },
    fallbackText: {
      color: token.colorText,
      fontSize: size * 0.6,
      fontWeight: '500',
    },
    image: {
      height: '100%',
      width: '100%',
    },
    loading: {
      position: 'absolute',
    },
  }),
);
