'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["symbol", "language", "children", "copyable", "type", "spotlight", "className"];
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import CopyButton from "../CopyButton";
import SyntaxHighlighter from "../Highlighter/SyntaxHighlighter";
import Spotlight from "../Spotlight";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Snippet = /*#__PURE__*/memo(function (_ref) {
  var symbol = _ref.symbol,
    _ref$language = _ref.language,
    language = _ref$language === void 0 ? 'tsx' : _ref$language,
    children = _ref.children,
    _ref$copyable = _ref.copyable,
    copyable = _ref$copyable === void 0 ? true : _ref$copyable,
    _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'ghost' : _ref$type,
    spotlight = _ref.spotlight,
    className = _ref.className,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(type),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsxs(Flexbox, _objectSpread(_objectSpread({
    align: 'center',
    className: cx(styles.container, className),
    gap: 8,
    horizontal: true
  }, rest), {}, {
    children: [spotlight && /*#__PURE__*/_jsx(Spotlight, {}), /*#__PURE__*/_jsx(SyntaxHighlighter, {
      language: language,
      children: [symbol, children].filter(Boolean).join(' ')
    }), copyable && /*#__PURE__*/_jsx(CopyButton, {
      content: children,
      size: {
        blockSize: 24,
        fontSize: 14
      }
    })]
  }));
});
export default Snippet;