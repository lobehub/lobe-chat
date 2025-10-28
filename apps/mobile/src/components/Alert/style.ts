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
    close: {
      alignSelf: 'flex-start',
      position: 'absolute',
      right: 8,
      top: 8,
    },
    container: {
      backgroundColor: status.backgroundColor,
      borderColor: status.borderColor,

      flexDirection: 'row',
      gap: token.marginXS,
      padding: token.padding,
      width: '100%',
    },

    description: {
      color: token.colorTextSecondary,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      marginTop: token.marginXS,
    },
    iconWrapper: {
      marginTop: 2,
    },
    message: {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
    },
  };
});
