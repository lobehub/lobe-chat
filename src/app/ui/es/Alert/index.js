'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["closeIcon", "closable", "description", "showIcon", "type", "variant", "icon", "colorfulText", "style", "extra", "classNames", "text", "extraDefaultExpand", "extraIsolate", "banner"];
import { Alert as AntdAlert, message } from 'antd';
import { camelCase } from 'lodash-es';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronRight, Info, X, XCircle } from 'lucide-react';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import ActionIcon from "../ActionIcon";
import Icon from "../Icon";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var typeIcons = {
  error: XCircle,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle
};
var colors = function colors(theme) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
  for (var _len = arguments.length, keys = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    keys[_key - 2] = arguments[_key];
  }
  return theme[camelCase(['color', type].concat(keys).join('-'))];
};
var Alert = /*#__PURE__*/memo(function (_ref) {
  var closeIcon = _ref.closeIcon,
    _ref$closable = _ref.closable,
    closable = _ref$closable === void 0 ? false : _ref$closable,
    description = _ref.description,
    _ref$showIcon = _ref.showIcon,
    showIcon = _ref$showIcon === void 0 ? true : _ref$showIcon,
    _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'info' : _ref$type,
    variant = _ref.variant,
    icon = _ref.icon,
    _ref$colorfulText = _ref.colorfulText,
    colorfulText = _ref$colorfulText === void 0 ? true : _ref$colorfulText,
    style = _ref.style,
    extra = _ref.extra,
    classNames = _ref.classNames,
    text = _ref.text,
    _ref$extraDefaultExpa = _ref.extraDefaultExpand,
    extraDefaultExpand = _ref$extraDefaultExpa === void 0 ? false : _ref$extraDefaultExpa,
    extraIsolate = _ref.extraIsolate,
    banner = _ref.banner,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(extraDefaultExpand),
    _useState2 = _slicedToArray(_useState, 2),
    expand = _useState2[0],
    setExpand = _useState2[1];
  var _useStyles = useStyles({
      closable: !!closable,
      hasTitle: !!description,
      showIcon: !!showIcon
    }),
    theme = _useStyles.theme,
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  var isInsideExtra = !extraIsolate && !!extra;
  var alert = /*#__PURE__*/_jsx(AntdAlert, _objectSpread({
    banner: banner,
    className: cx(styles.container, colorfulText && styles.colorfulText, !!isInsideExtra && styles.hasExtra, variant === 'block' && styles.variantBlock, variant === 'ghost' && styles.variantGhost, variant === 'pure' && styles.variantPure, classNames === null || classNames === void 0 ? void 0 : classNames.alert, !isInsideExtra && styles.container),
    closable: closable,
    closeIcon: closeIcon || /*#__PURE__*/_jsx(ActionIcon, {
      color: colors(theme, type),
      icon: X,
      size: 'small'
    }),
    description: description,
    icon: /*#__PURE__*/_jsx(Icon, {
      icon: typeIcons[type] || icon,
      size: {
        fontSize: description ? 24 : 18
      }
    }),
    showIcon: showIcon,
    style: _objectSpread({
      color: colorfulText ? colors(theme, type) : undefined
    }, style),
    type: type
  }, rest));
  if (!extra) return alert;
  if (extraIsolate) return /*#__PURE__*/_jsxs(Flexbox, {
    className: classNames === null || classNames === void 0 ? void 0 : classNames.container,
    gap: 8,
    children: [alert, extra]
  });
  return /*#__PURE__*/_jsxs(Flexbox, {
    className: classNames === null || classNames === void 0 ? void 0 : classNames.container,
    children: [alert, /*#__PURE__*/_jsxs(Flexbox, {
      className: cx(styles.extra, banner && styles.banner, variant === 'block' && styles.variantBlock, variant === 'ghost' && styles.variantGhost, variant === 'pure' && styles.variantPure),
      style: {
        background: colors(theme, type, 'bg'),
        borderColor: colors(theme, type, 'border'),
        color: colors(theme, type),
        fontSize: description ? 14 : 12
      },
      children: [/*#__PURE__*/_jsxs(Flexbox, {
        align: 'center',
        className: cx(styles.extraHeader, variant === 'pure' && styles.variantPureExtraHeader),
        gap: message ? 6 : 10,
        horizontal: true,
        style: {
          borderColor: colors(theme, type, 'border')
        },
        children: [/*#__PURE__*/_jsx(ActionIcon, {
          color: colorfulText ? colors(theme, type) : undefined,
          icon: expand ? ChevronDown : ChevronRight,
          onClick: function onClick() {
            return setExpand(!expand);
          },
          size: {
            blockSize: 24,
            fontSize: 18
          }
        }), /*#__PURE__*/_jsx("div", {
          className: cx(styles.expandText),
          onClick: function onClick() {
            return setExpand(!expand);
          },
          children: (text === null || text === void 0 ? void 0 : text.detail) || 'Show Details'
        })]
      }), expand && /*#__PURE__*/_jsx("div", {
        className: cx(styles.extraBody, variant === 'pure' && styles.variantPure),
        children: extra
      })]
    })]
  });
});
export default Alert;