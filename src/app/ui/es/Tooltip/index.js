'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["className", "arrow"];
import { Tooltip as AntdTooltip } from 'antd';
import { memo } from 'react';
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var Tooltip = /*#__PURE__*/memo(function (_ref) {
  var className = _ref.className,
    _ref$arrow = _ref.arrow,
    arrow = _ref$arrow === void 0 ? false : _ref$arrow,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsx(AntdTooltip, _objectSpread({
    arrow: arrow,
    overlayClassName: cx(styles.tooltip, className)
  }, rest));
});
export default Tooltip;