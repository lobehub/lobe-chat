'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import useControlledState from 'use-merge-value';
import Icon from "../Icon";
import Img from "../Img";
import { useStyles } from "./styles";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var SelectWithImg = /*#__PURE__*/memo(function (_ref) {
  var className = _ref.className,
    style = _ref.style,
    value = _ref.value,
    defaultValue = _ref.defaultValue,
    onChange = _ref.onChange,
    options = _ref.options,
    _ref$width = _ref.width,
    width = _ref$width === void 0 ? 144 : _ref$width,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? 86 : _ref$height,
    _ref$styles = _ref.styles,
    outStyles = _ref$styles === void 0 ? {} : _ref$styles,
    _ref$classNames = _ref.classNames,
    classNames = _ref$classNames === void 0 ? {} : _ref$classNames,
    unoptimized = _ref.unoptimized;
  var _useControlledState = useControlledState(defaultValue, {
      defaultValue: defaultValue,
      onChange: onChange,
      value: value
    }),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    currentValue = _useControlledState2[0],
    setCurrentValue = _useControlledState2[1];
  var _useStyles = useStyles(),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsx(Flexbox, {
    className: className,
    gap: 16,
    horizontal: true,
    style: style,
    children: options === null || options === void 0 ? void 0 : options.map(function (item) {
      var isActive = item.value === currentValue;
      return /*#__PURE__*/_jsxs(Flexbox, {
        align: 'center',
        className: cx(styles.container, isActive && styles.active),
        gap: 4,
        onClick: function onClick() {
          return setCurrentValue(item.value);
        },
        children: [/*#__PURE__*/_jsx("div", {
          className: cx(styles.imgCtn, isActive && styles.imgActive, classNames.img),
          style: _objectSpread(_objectSpread({}, outStyles.img), {}, {
            height: height,
            width: width
          }),
          children: /*#__PURE__*/_jsx("div", {
            className: styles.img,
            children: /*#__PURE__*/_jsx(Img, {
              alt: typeof item.label === 'string' ? item.label : item.ariaLabel,
              height: height,
              src: item.img,
              unoptimized: unoptimized,
              width: width
            })
          })
        }), /*#__PURE__*/_jsxs(Flexbox, {
          align: 'center',
          gap: 4,
          horizontal: true,
          children: [item.icon && /*#__PURE__*/_jsx(Icon, {
            icon: item.icon
          }), item.label]
        })]
      }, item.value);
    })
  });
});
export default SelectWithImg;