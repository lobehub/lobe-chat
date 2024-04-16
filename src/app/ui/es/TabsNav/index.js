'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["className", "variant"];
import { Tabs } from 'antd';
import { memo } from 'react';
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var TabsNav = /*#__PURE__*/memo(function (_ref) {
  var className = _ref.className,
    variant = _ref.variant,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsx(Tabs, _objectSpread({
    className: cx(styles.tabs, variant === 'compact' && styles.compact, className)
  }, rest));
});
export default TabsNav;