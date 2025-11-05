import { StyleSheet } from 'react-native';

import { type AliasToken, createStyles } from '@/components/styles';

import type { AlertType } from './type';

export interface AlertStatusTokens {
  backgroundColor: string;
  borderColor: string;
  iconColor: string;
  messageColor: string;
}

const getStatusMap = (token: AliasToken) => ({
  error: {
    backgroundColor: token.colorErrorFillTertiary,
    borderColor: token.colorErrorFillSecondary,
    iconColor: token.colorError,
    messageColor: token.colorErrorText,
  },
  info: {
    backgroundColor: token.colorInfoFillTertiary,
    borderColor: token.colorInfoFillSecondary,
    iconColor: token.colorInfo,
    messageColor: token.colorInfoText,
  },
  success: {
    backgroundColor: token.colorSuccessFillTertiary,
    borderColor: token.colorSuccessFillSecondary,
    iconColor: token.colorSuccess,
    messageColor: token.colorSuccessText,
  },
  warning: {
    backgroundColor: token.colorWarningFillTertiary,
    borderColor: token.colorWarningFillSecondary,
    iconColor: token.colorWarning,
    messageColor: token.colorWarningText,
  },
});

export const getAlertStatusTokens = (token: AliasToken, type: AlertType): AlertStatusTokens => {
  const map = getStatusMap(token);
  return map[type] ?? map.info;
};

export const useStyles = createStyles(({ token }, type: AlertType = 'info') => {
  const status = getAlertStatusTokens(token, type);

  return {
    action: {
      marginTop: token.marginSM,
    },
    borderless: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    close: {
      alignSelf: 'flex-start',
      position: 'absolute' as const,
      right: 8,
      top: 8,
    },

    container: {
      width: '100%',
    },

    description: {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      marginTop: 4,
      opacity: 0.75,
    },
    descriptionColorful: {
      color: status.messageColor,
    },
    descriptionDefault: {
      color: token.colorTextSecondary,
    },

    expandText: {
      flex: 1,
    },

    // Extra styles
    extra: {
      borderBottomLeftRadius: token.borderRadiusLG * 1.5,
      borderBottomRightRadius: token.borderRadiusLG * 1.5,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: status.borderColor,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderTopWidth: 0,
      overflow: 'hidden' as const,
    },
    extraBody: {
      paddingHorizontal: 6,
      paddingVertical: 4,
    },
    extraBodyBorderless: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },

    extraFilled: {
      backgroundColor: status.backgroundColor,
    },

    extraHeader: {
      borderColor: status.borderColor,
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 6,
      paddingVertical: 4,
    },

    extraOutlined: {
      backgroundColor: 'transparent',
    },

    // Variant styles
    filled: {
      backgroundColor: status.backgroundColor,
      borderColor: status.borderColor,
    },

    // hasExtra - 当有 extra 时，移除底部圆角
    hasExtra: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderBottomWidth: 0,
    },

    iconWrapper: {
      marginTop: 2,
    },
    message: {
      lineHeight: token.lineHeightLG,
    },
    messageColorful: {
      color: status.messageColor,
    },
    messageDefault: {
      color: token.colorText,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: status.borderColor,
    },
  };
});
