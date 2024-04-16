'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Swatches = /*#__PURE__*/memo(function (_ref) {
  var colors = _ref.colors,
    activeColor = _ref.activeColor,
    onSelect = _ref.onSelect,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 24 : _ref$size;
  var theme = useTheme();
  var _useStyles = useStyles(size),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsxs(Flexbox, {
    gap: 8,
    horizontal: true,
    style: {
      flexWrap: 'wrap'
    },
    children: [/*#__PURE__*/_jsx(Flexbox, {
      className: cx(styles.container, !activeColor && styles.active),
      onClick: function onClick() {
        onSelect === null || onSelect === void 0 || onSelect();
      },
      style: {
        background: theme.colorBgContainer
      }
    }), colors.map(function (c) {
      var isActive = c === activeColor;
      return /*#__PURE__*/_jsx(Flexbox, {
        className: cx(styles.container, isActive && styles.active),
        onClick: function onClick() {
          onSelect === null || onSelect === void 0 || onSelect(c);
        },
        style: {
          background: c
        }
      }, c);
    })]
  });
});
export default Swatches;