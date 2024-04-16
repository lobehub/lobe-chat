'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["fullFeatured", "copyButtonSize", "children", "language", "className", "style", "copyable", "showLanguage", "type", "spotlight", "allowChangeLanguage", "fileName", "icon"];
import { memo } from 'react';
import CopyButton from "../CopyButton";
import Spotlight from "../Spotlight";
import Tag from "../Tag";
import FullFeatured from "./FullFeatured";
import SyntaxHighlighter from "./SyntaxHighlighter";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
export var Highlighter = /*#__PURE__*/memo(function (_ref) {
  var fullFeatured = _ref.fullFeatured,
    _ref$copyButtonSize = _ref.copyButtonSize,
    copyButtonSize = _ref$copyButtonSize === void 0 ? 'site' : _ref$copyButtonSize,
    children = _ref.children,
    language = _ref.language,
    className = _ref.className,
    style = _ref.style,
    _ref$copyable = _ref.copyable,
    copyable = _ref$copyable === void 0 ? true : _ref$copyable,
    _ref$showLanguage = _ref.showLanguage,
    showLanguage = _ref$showLanguage === void 0 ? true : _ref$showLanguage,
    _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'block' : _ref$type,
    spotlight = _ref.spotlight,
    _ref$allowChangeLangu = _ref.allowChangeLanguage,
    allowChangeLanguage = _ref$allowChangeLangu === void 0 ? true : _ref$allowChangeLangu,
    fileName = _ref.fileName,
    icon = _ref.icon,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(type),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  var container = cx(styles.container, className);
  if (fullFeatured) return /*#__PURE__*/_jsx(FullFeatured, _objectSpread(_objectSpread({
    allowChangeLanguage: allowChangeLanguage,
    className: className,
    fileName: fileName,
    icon: icon,
    language: language,
    style: style
  }, rest), {}, {
    children: children
  }));
  return /*#__PURE__*/_jsxs("div", _objectSpread(_objectSpread({
    className: container,
    "data-code-type": "highlighter",
    style: style
  }, rest), {}, {
    children: [spotlight && /*#__PURE__*/_jsx(Spotlight, {
      size: 240
    }), copyable && /*#__PURE__*/_jsx(CopyButton, {
      className: styles.button,
      content: children,
      placement: "left",
      size: copyButtonSize
    }), showLanguage && language && /*#__PURE__*/_jsx(Tag, {
      className: styles.lang,
      children: language.toLowerCase()
    }), /*#__PURE__*/_jsx(SyntaxHighlighter, {
      language: language === null || language === void 0 ? void 0 : language.toLowerCase(),
      children: children
    })]
  }));
});
export default Highlighter;
export { default as SyntaxHighlighter } from "./SyntaxHighlighter";