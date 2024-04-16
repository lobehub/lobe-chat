'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["color", "fill", "className", "active", "icon", "size", "style", "glass", "title", "placement", "arrow", "spotlight", "onClick", "children", "loading", "tooltipDelay", "fillOpacity", "fillRule", "focusable", "disable", "spin"];
import { Loader2 } from 'lucide-react';
import { forwardRef, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';
import Icon from "../Icon";
import Spotlight from "../Spotlight";
import Tooltip from "../Tooltip";
import { calcSize } from "./calcSize";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var ActionIcon = /*#__PURE__*/forwardRef(function (_ref, ref) {
  var color = _ref.color,
    fill = _ref.fill,
    className = _ref.className,
    active = _ref.active,
    icon = _ref.icon,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 'normal' : _ref$size,
    style = _ref.style,
    glass = _ref.glass,
    title = _ref.title,
    placement = _ref.placement,
    _ref$arrow = _ref.arrow,
    arrow = _ref$arrow === void 0 ? false : _ref$arrow,
    spotlight = _ref.spotlight,
    onClick = _ref.onClick,
    children = _ref.children,
    loading = _ref.loading,
    _ref$tooltipDelay = _ref.tooltipDelay,
    tooltipDelay = _ref$tooltipDelay === void 0 ? 0.5 : _ref$tooltipDelay,
    fillOpacity = _ref.fillOpacity,
    fillRule = _ref.fillRule,
    focusable = _ref.focusable,
    disable = _ref.disable,
    iconSpinning = _ref.spin,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles({
      active: Boolean(active),
      glass: Boolean(glass)
    }),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  var _useMemo = useMemo(function () {
      return calcSize(size);
    }, [size]),
    blockSize = _useMemo.blockSize,
    borderRadius = _useMemo.borderRadius;
  var iconProps = {
    color: color,
    fill: fill,
    fillOpacity: fillOpacity,
    fillRule: fillRule,
    focusable: focusable,
    size: size === 'site' ? 'normal' : size
  };
  var content = icon && /*#__PURE__*/_jsx(Icon, _objectSpread(_objectSpread({
    className: styles.icon,
    icon: icon
  }, iconProps), {}, {
    spin: iconSpinning
  }));
  var spin = /*#__PURE__*/_jsx(Icon, _objectSpread(_objectSpread({
    icon: Loader2
  }, iconProps), {}, {
    spin: true
  }));
  var actionIconBlock = /*#__PURE__*/_jsxs(Flexbox, _objectSpread(_objectSpread({
    align: 'center',
    className: cx(styles.block, disable ? styles.disabled : styles.normal, className),
    horizontal: true,
    justify: 'center',
    onClick: loading || disable ? undefined : onClick,
    ref: ref,
    style: _objectSpread({
      borderRadius: borderRadius,
      height: blockSize,
      width: blockSize
    }, style)
  }, rest), {}, {
    children: [spotlight && /*#__PURE__*/_jsx(Spotlight, {}), loading ? spin : content, children]
  }));
  if (!title) return actionIconBlock;
  return /*#__PURE__*/_jsx(Tooltip, {
    arrow: arrow,
    mouseEnterDelay: tooltipDelay,
    overlayStyle: {
      pointerEvents: 'none'
    },
    placement: placement,
    title: title,
    children: actionIconBlock
  });
});
export default ActionIcon;