import { createStyles } from '@/components/ThemeProvider/createStyles';

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
    maxWidth: 400,
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
    height: 80,
    marginBottom: token.marginLG,
    width: 80,
  },
  securityLink: {
    color: token.colorLink,
    fontSize: token.fontSizeSM,
    lineHeight: 20,
    textAlign: 'center',
  },
  securityNote: {
    alignItems: 'center',
    marginBottom: token.marginLG,
    maxWidth: 400,
    width: '100%',
  },
  securityText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    lineHeight: 20,
    textAlign: 'center',
  },
  subtitle: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    lineHeight: 24,
    textAlign: 'center',
  },
  title: {
    color: token.colorText,
    fontSize: token.fontSizeHeading1,
    fontWeight: '600',
    marginBottom: token.marginSM,
  },
  welcome: {
    alignItems: 'center',
    marginBottom: token.marginXXL,
  },
}));
