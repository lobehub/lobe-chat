'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["className", "type"],
  _excluded2 = ["className", "type", "resize", "style"];
import { Input as AntInput } from 'antd';
import { forwardRef } from 'react';
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
export var Input = /*#__PURE__*/forwardRef(function (_ref, ref) {
  var className = _ref.className,
    _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'ghost' : _ref$type,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles({
      type: type
    }),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsx(AntInput, _objectSpread({
    className: cx(styles.input, className),
    ref: ref,
    variant: type === 'pure' ? 'borderless' : undefined
  }, rest));
});
export var TextArea = /*#__PURE__*/forwardRef(function (_ref2, ref) {
  var className = _ref2.className,
    _ref2$type = _ref2.type,
    type = _ref2$type === void 0 ? 'ghost' : _ref2$type,
    _ref2$resize = _ref2.resize,
    resize = _ref2$resize === void 0 ? true : _ref2$resize,
    style = _ref2.style,
    rest = _objectWithoutProperties(_ref2, _excluded2);
  var _useStyles2 = useStyles({
      type: type
    }),
    styles = _useStyles2.styles,
    cx = _useStyles2.cx;
  return /*#__PURE__*/_jsx(AntInput.TextArea, _objectSpread({
    className: cx(styles.textarea, className),
    ref: ref,
    style: resize ? style : _objectSpread({
      resize: 'none'
    }, style),
    variant: type === 'pure' ? 'borderless' : undefined
  }, rest));
});