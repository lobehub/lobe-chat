import { createStyles } from '@/theme';

export const useStyles = createStyles(
  (token, hasDescription: boolean = false, active: boolean = false) => ({
    avatar: {
      borderRadius: token.borderRadiusLG + token.borderRadiusXS,
      height: token.controlHeightLG,
      marginRight: token.marginSM,
      width: token.controlHeightLG,
    },
    description: {
      color: token.colorTextSecondary,
      fontSize: token.fontSize * 0.9, //To fix iOS text clipping issue
    },
    emoji: {
      fontSize: token.controlHeightLG,
    },
    emojiContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: token.marginSM,
    },
    extra: {
      overflow: 'hidden',
    },
    info: {
      flex: 1,
      justifyContent: hasDescription ? 'flex-start' : 'center',
    },
    listItem: {
      alignItems: 'center',
      backgroundColor: active ? token.colorFillSecondary : 'transparent',
      borderRadius: token.borderRadius,
      color: active ? token.colorText : token.colorTextTertiary,
      flexDirection: 'row',
      gap: token.marginSM,
      marginBottom: token.marginXS,
      padding: token.paddingSM,
    },
    title: {
      color: token.colorText,
      fontSize: token.fontSizeLG,
      fontWeight: token.fontWeightStrong,
      marginBottom: hasDescription ? token.marginXS : 0,
    },
  }),
);
