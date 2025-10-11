import { type AliasToken, createStyles } from '@/theme';

import type { AlertType } from './type';

export interface AlertStatusTokens {
  backgroundColor: string;
  borderColor: string;
  iconColor: string;
  messageColor: string;
}

const getStatusMap = (token: AliasToken) => ({
  error: {
    backgroundColor: token.colorErrorBg,
    borderColor: token.colorErrorBorder,
    iconColor: token.colorError,
    messageColor: token.colorErrorText,
  },
  info: {
    backgroundColor: token.colorInfoBg,
    borderColor: token.colorInfoBorder,
    iconColor: token.colorInfo,
    messageColor: token.colorInfoText,
  },
  success: {
    backgroundColor: token.colorSuccessBg,
    borderColor: token.colorSuccessBorder,
    iconColor: token.colorSuccess,
    messageColor: token.colorSuccessText,
  },
  warning: {
    backgroundColor: token.colorWarningBg,
    borderColor: token.colorWarningBorder,
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
      marginTop: 2,
    },
    container: {
      // alignItems: 'flex-start',
      // alignSelf: 'stretch',
      backgroundColor: status.backgroundColor,
      borderColor: status.borderColor,
      borderRadius: token.borderRadiusLG,
      borderWidth: 1,
      flexDirection: 'row',
      gap: token.marginXS,
      padding: token.padding,
      width: '100%',
    },
    content: {
      flex: 1,
      minWidth: 0,
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
