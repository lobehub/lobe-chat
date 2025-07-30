import { Platform } from 'react-native';

import { createStyles } from '@/theme';

const monospaceFontFamily = Platform.select({
  android: 'monospace',
  ios: 'Menlo',
});

export const useStyles = createStyles((token) => ({
  codeContainer: {
    alignSelf: 'stretch',
    backgroundColor: token.colorBgContainer,
    borderRadius: 0,
    flexShrink: 1,
    margin: 0,
    padding: token.paddingSM,
  },
  codeContainerCompact: {
    padding: token.paddingXS,
  },
  codeLine: {
    flexDirection: 'row',
    fontFamily: monospaceFontFamily,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight * token.fontSize,
  },
  codeLineCompact: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM * token.fontSizeSM,
  },
  codeScrollContainer: {
    flexDirection: 'column',
    minWidth: '100%',
  },
  codeText: {
    fontFamily: monospaceFontFamily,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight * token.fontSize,
  },
  codeTextCompact: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM * token.fontSizeSM,
  },
  container: {
    backgroundColor: token.colorBgElevated,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    overflow: 'hidden',
  },
  copyButton: {
    padding: token.paddingXXS,
  },
  demoSection: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: token.colorErrorBg,
    borderColor: token.colorError,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    marginHorizontal: token.marginLG,
    padding: token.padding,
  },
  errorText: {
    color: token.colorError,
    fontSize: token.fontSize,
  },
  expandIcon: {
    padding: token.paddingXXS,
  },
  header: {
    marginBottom: token.marginLG,
    marginHorizontal: token.marginLG,
    marginTop: token.marginXXL,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minWidth: 180,
    paddingHorizontal: 50,
  },
  headerContainer: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderBottomColor: token.colorBorder,
    borderBottomWidth: token.lineWidth,
    flexDirection: 'row',
    height: 44,
    justifyContent: 'space-between',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXXS,
    left: token.paddingSM,
    position: 'absolute',
    zIndex: 10,
  },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
    position: 'absolute',
    right: token.paddingSM,
    zIndex: 10,
  },
  headerTitle: {
    color: token.colorText,
    fontSize: token.fontSizeSM,
    fontWeight: '600',
    textAlign: 'center',
  },
  languageTag: {
    backgroundColor: token.colorFillSecondary,
    borderRadius: token.borderRadiusXS,
    color: token.colorText,
    fontSize: token.fontSizeSM,
    fontWeight: '600',
    paddingHorizontal: token.paddingXS,
    paddingVertical: 2,
    position: 'absolute',
    right: token.paddingSM,
    top: token.paddingXS,
    zIndex: 1,
  },
  statusContainer: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    flexDirection: 'row',
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  statusLabel: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    marginRight: token.marginXS,
  },
  statusValue: {
    color: token.colorText,
    fontSize: token.fontSize,
    fontWeight: '600',
  },
  title: {
    color: token.colorTextHeading,
    fontSize: token.fontSizeHeading1,
    fontWeight: 'bold',
    marginBottom: token.marginLG,
  },
}));
