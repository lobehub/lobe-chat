import { createStyles } from '@/theme';
import { LOGO_SIZE } from '@/const/common';

export const useStyles = createStyles((token) => ({
  container: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    flex: 1,
    justifyContent: 'space-between',
    padding: token.paddingXL,
  },
  content: {
    alignItems: 'center',
    maxWidth: token.screenSM,
    width: '100%',
  },
  errorContainer: {
    backgroundColor: token.colorErrorBg,
    borderRadius: token.borderRadius,
    marginBottom: token.marginLG,
    padding: token.padding,
    width: '100%',
  },
  errorText: {
    color: token.colorError,
    fontSize: token.fontSize,
    textAlign: 'center',
  },
  header: {},
  loginButton: {
    marginBottom: token.marginXL,
  },
  logo: {
    height: LOGO_SIZE,
    marginBottom: token.marginLG,
    width: LOGO_SIZE,
  },
  securityLink: {
    color: token.colorLink,
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    textAlign: 'center',
  },
  securityNote: {
    alignItems: 'center',
    marginBottom: token.marginLG,
    maxWidth: token.screenSM,
    width: '100%',
  },
  securityText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    textAlign: 'center',
  },
  subtitle: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    textAlign: 'center',
  },
  title: {
    color: token.colorText,
    fontSize: token.fontSizeHeading1,
    fontWeight: token.fontWeightStrong,
    marginBottom: token.marginSM,
  },
  welcome: {
    alignItems: 'center',
    marginBottom: token.marginXXL,
  },
}));
