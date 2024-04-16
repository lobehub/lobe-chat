'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["glow", "children", "className", "size"];
import { Button } from 'antd';
import { memo } from 'react';
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var GradientButton = /*#__PURE__*/memo(function (_ref) {
  var _ref$glow = _ref.glow,
    glow = _ref$glow === void 0 ? true : _ref$glow,
    children = _ref.children,
    className = _ref.className,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 'large' : _ref$size,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(size),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsxs(Button, _objectSpread(_objectSpread({
    className: cx(styles.button, className),
    size: size
  }, rest), {}, {
    children: [glow && /*#__PURE__*/_jsx("div", {
      className: styles.glow
    }), children]
  }));
});
export default GradientButton;