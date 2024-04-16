'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["icon", "size", "color", "fill", "className", "focusable", "spin", "fillRule", "fillOpacity"],
  _excluded2 = ["fontSize"];
import { forwardRef, useMemo } from 'react';
import { calcSize } from "./calcSize";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var Icon = /*#__PURE__*/forwardRef(function (_ref, ref) {
  var icon = _ref.icon,
    size = _ref.size,
    color = _ref.color,
    _ref$fill = _ref.fill,
    fill = _ref$fill === void 0 ? 'transparent' : _ref$fill,
    className = _ref.className,
    focusable = _ref.focusable,
    spin = _ref.spin,
    fillRule = _ref.fillRule,
    fillOpacity = _ref.fillOpacity,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  var SvgIcon = icon;
  var _useMemo = useMemo(function () {
      return calcSize(size);
    }, [size]),
    fontSize = _useMemo.fontSize,
    restSize = _objectWithoutProperties(_useMemo, _excluded2);
  return /*#__PURE__*/_jsx("span", _objectSpread(_objectSpread({
    className: cx('anticon', spin && styles.spin, className),
    role: "img"
  }, rest), {}, {
    children: /*#__PURE__*/_jsx(SvgIcon, _objectSpread({
      color: color,
      fill: fill,
      fillOpacity: fillOpacity,
      fillRule: fillRule,
      focusable: focusable,
      height: fontSize,
      ref: ref,
      size: fontSize,
      width: fontSize
    }, restSize))
  }));
});
export default Icon;