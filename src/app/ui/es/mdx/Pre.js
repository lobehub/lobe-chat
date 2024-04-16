'use client';

import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2;
import { createStyles } from 'antd-style';
import Highlighter from "../Highlighter";
import Snippet from "../Snippet";
import { FALLBACK_LANG } from "../hooks/useHighlight";
import { jsx as _jsx } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var css = _ref.css;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    overflow: hidden;\n    margin-block: 1em;\n    border-radius: calc(var(--lobe-markdown-border-radius) * 1px);\n    box-shadow: 0 0 0 1px var(--lobe-markdown-border-color);\n  "]))),
    highlight: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    pre {\n      overflow-x: hidden !important;\n      padding: 1em !important;\n    }\n  "])))
  };
});
export var Pre = function Pre(_ref2) {
  var fullFeatured = _ref2.fullFeatured,
    fileName = _ref2.fileName,
    allowChangeLanguage = _ref2.allowChangeLanguage,
    _ref2$lang = _ref2.lang,
    lang = _ref2$lang === void 0 ? FALLBACK_LANG : _ref2$lang,
    children = _ref2.children,
    className = _ref2.className,
    style = _ref2.style,
    icon = _ref2.icon;
  var _useStyles = useStyles(),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsx(Highlighter, {
    allowChangeLanguage: allowChangeLanguage,
    className: cx(styles.container, styles.highlight, className),
    copyButtonSize: {
      blockSize: 28,
      fontSize: 16
    },
    fileName: fileName,
    fullFeatured: fullFeatured,
    icon: icon,
    language: lang,
    style: style,
    type: "block",
    children: children
  });
};
export var PreSingleLine = function PreSingleLine(_ref3) {
  var _ref3$lang = _ref3.lang,
    lang = _ref3$lang === void 0 ? FALLBACK_LANG : _ref3$lang,
    children = _ref3.children,
    className = _ref3.className,
    style = _ref3.style;
  var _useStyles2 = useStyles(),
    cx = _useStyles2.cx,
    styles = _useStyles2.styles;
  return /*#__PURE__*/_jsx(Snippet, {
    className: cx(styles.container, className),
    "data-code-type": "highlighter",
    language: lang,
    style: style,
    type: 'block',
    children: children
  });
};
export default Pre;