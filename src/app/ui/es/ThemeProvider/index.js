'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["children", "customStylish", "customToken", "enableWebfonts", "enableGlobalStyle", "webfonts", "customTheme", "className", "style"];
import { App } from 'antd';
import { ThemeProvider as AntdThemeProvider, StyleProvider } from 'antd-style';
import { memo, useCallback } from 'react';
import { useCdnFn } from "../ConfigProvider";
import FontLoader from "../FontLoader";
import { lobeCustomStylish, lobeCustomToken } from "../styles";
import { createLobeAntdTheme } from "../styles/theme/antdTheme";
import GlobalStyle from "./GlobalStyle";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
var ThemeProvider = /*#__PURE__*/memo(function (_ref) {
  var children = _ref.children,
    customStylish = _ref.customStylish,
    customToken = _ref.customToken,
    _ref$enableWebfonts = _ref.enableWebfonts,
    enableWebfonts = _ref$enableWebfonts === void 0 ? true : _ref$enableWebfonts,
    _ref$enableGlobalStyl = _ref.enableGlobalStyle,
    enableGlobalStyle = _ref$enableGlobalStyl === void 0 ? true : _ref$enableGlobalStyl,
    webfonts = _ref.webfonts,
    _ref$customTheme = _ref.customTheme,
    customTheme = _ref$customTheme === void 0 ? {} : _ref$customTheme,
    className = _ref.className,
    style = _ref.style,
    res = _objectWithoutProperties(_ref, _excluded);
  var genCdnUrl = useCdnFn();
  var webfontUrls = webfonts || [genCdnUrl({
    path: 'css/index.css',
    pkg: '@lobehub/webfont-mono',
    version: '1.0.0'
  }), genCdnUrl({
    path: 'css/index.css',
    pkg: '@lobehub/webfont-harmony-sans',
    version: '1.0.0'
  }), genCdnUrl({
    path: 'css/index.css',
    pkg: '@lobehub/webfont-harmony-sans-sc',
    version: '1.0.0'
  }), genCdnUrl({
    path: 'dist/katex.min.css',
    pkg: 'katex',
    version: '0.16.8'
  })];
  var stylish = useCallback(function (theme) {
    return _objectSpread(_objectSpread({}, lobeCustomStylish(theme)), customStylish === null || customStylish === void 0 ? void 0 : customStylish(theme));
  }, [customStylish]);
  var token = useCallback(function (theme) {
    return _objectSpread(_objectSpread({}, lobeCustomToken(theme)), customToken === null || customToken === void 0 ? void 0 : customToken(theme));
  }, [customToken]);
  var theme = useCallback(function (appearance) {
    return createLobeAntdTheme({
      appearance: appearance,
      neutralColor: customTheme.neutralColor,
      primaryColor: customTheme.primaryColor
    });
  }, [customTheme.primaryColor, customTheme.neutralColor]);
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [enableWebfonts && (webfontUrls === null || webfontUrls === void 0 ? void 0 : webfontUrls.length) > 0 && webfontUrls.map(function (webfont) {
      return /*#__PURE__*/_jsx(FontLoader, {
        url: webfont
      }, webfont);
    }), /*#__PURE__*/_jsx(StyleProvider, {
      speedy: process.env.NODE_ENV === 'production',
      children: /*#__PURE__*/_jsxs(AntdThemeProvider, _objectSpread(_objectSpread({
        customStylish: stylish,
        customToken: token
      }, res), {}, {
        theme: theme,
        children: [enableGlobalStyle && /*#__PURE__*/_jsx(GlobalStyle, {}), /*#__PURE__*/_jsx(App, {
          className: className,
          style: _objectSpread({
            minHeight: 'inherit',
            width: 'inherit'
          }, style),
          children: children
        })]
      }))
    })]
  });
});
ThemeProvider.displayName = 'LobeThemeProvider';
export default ThemeProvider;