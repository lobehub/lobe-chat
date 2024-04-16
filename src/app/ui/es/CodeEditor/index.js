'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["style", "language", "value", "onValueChange", "resize", "className", "textareaClassName", "type"];
import { forwardRef } from 'react';
import Editor from 'react-simple-code-editor';
import SyntaxHighlighter from "../Highlighter/SyntaxHighlighter";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var CodeEditor = /*#__PURE__*/forwardRef(function (_ref, ref) {
  var style = _ref.style,
    language = _ref.language,
    value = _ref.value,
    onValueChange = _ref.onValueChange,
    _ref$resize = _ref.resize,
    resize = _ref$resize === void 0 ? true : _ref$resize,
    className = _ref.className,
    textareaClassName = _ref.textareaClassName,
    _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'ghost' : _ref$type,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles({
      resize: resize,
      type: type
    }),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsx("div", {
    className: cx(styles.container, className),
    style: style,
    children: /*#__PURE__*/_jsx(Editor, _objectSpread({
      className: styles.editor,
      highlight: function highlight(code) {
        return /*#__PURE__*/_jsx(SyntaxHighlighter, {
          language: language,
          children: code
        });
      },
      onValueChange: onValueChange,
      padding: 0,
      ref: ref,
      textareaClassName: cx(styles.textarea, textareaClassName),
      value: value
    }, rest))
  });
});
export default CodeEditor;