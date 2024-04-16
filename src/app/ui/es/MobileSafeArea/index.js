'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["position", "className"];
import React, { memo } from 'react';
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var MobileSafeArea = /*#__PURE__*/memo(function (_ref) {
  var position = _ref.position,
    className = _ref.className,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsx("div", _objectSpread({
    className: cx(styles.container, styles[position], className)
  }, rest));
});
export default MobileSafeArea;