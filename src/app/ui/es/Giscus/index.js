'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["style", "className", "reactionsEnabled", "mapping", "lang", "inputPosition", "id", "loading", "emitMetadata"];
import GiscusComponent from '@giscus/react';
import { useTheme, useThemeMode } from 'antd-style';
import { memo, useMemo } from 'react';
import { formatLang, genStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var Giscus = /*#__PURE__*/memo(function (_ref) {
  var style = _ref.style,
    className = _ref.className,
    _ref$reactionsEnabled = _ref.reactionsEnabled,
    reactionsEnabled = _ref$reactionsEnabled === void 0 ? '1' : _ref$reactionsEnabled,
    _ref$mapping = _ref.mapping,
    mapping = _ref$mapping === void 0 ? 'title' : _ref$mapping,
    _ref$lang = _ref.lang,
    lang = _ref$lang === void 0 ? 'en_US' : _ref$lang,
    _ref$inputPosition = _ref.inputPosition,
    inputPosition = _ref$inputPosition === void 0 ? 'top' : _ref$inputPosition,
    _ref$id = _ref.id,
    id = _ref$id === void 0 ? 'giscus' : _ref$id,
    _ref$loading = _ref.loading,
    loading = _ref$loading === void 0 ? 'lazy' : _ref$loading,
    _ref$emitMetadata = _ref.emitMetadata,
    emitMetadata = _ref$emitMetadata === void 0 ? '0' : _ref$emitMetadata,
    rest = _objectWithoutProperties(_ref, _excluded);
  var token = useTheme();
  var _useThemeMode = useThemeMode(),
    isDarkMode = _useThemeMode.isDarkMode;
  var giscusTheme = useMemo(function () {
    return btoa(genStyles(token, isDarkMode).styles);
  }, [isDarkMode, token]);
  return /*#__PURE__*/_jsx("div", {
    className: className,
    style: style,
    children: /*#__PURE__*/_jsx(GiscusComponent, _objectSpread({
      emitMetadata: emitMetadata,
      id: id,
      inputPosition: inputPosition,
      lang: formatLang(lang),
      loading: loading,
      mapping: mapping,
      reactionsEnabled: reactionsEnabled,
      theme: "data:text/css;base64,".concat(giscusTheme)
    }, rest))
  });
});
export default Giscus;