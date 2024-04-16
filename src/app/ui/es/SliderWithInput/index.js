'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["step", "value", "onChange", "max", "min", "defaultValue", "size", "controls", "gap", "style", "className", "disabled"];
import { InputNumber, Slider } from 'antd';
import { isNull } from 'lodash-es';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var SliderWithInput = /*#__PURE__*/memo(function (_ref) {
  var step = _ref.step,
    value = _ref.value,
    onChange = _ref.onChange,
    max = _ref.max,
    min = _ref.min,
    defaultValue = _ref.defaultValue,
    size = _ref.size,
    controls = _ref.controls,
    _ref$gap = _ref.gap,
    gap = _ref$gap === void 0 ? 16 : _ref$gap,
    style = _ref.style,
    className = _ref.className,
    disabled = _ref.disabled,
    rest = _objectWithoutProperties(_ref, _excluded);
  var handleOnchange = useCallback(function (value) {
    if (Number.isNaN(value) || isNull(value)) return;
    onChange === null || onChange === void 0 || onChange(value);
  }, []);
  return /*#__PURE__*/_jsxs(Flexbox, {
    align: 'center',
    className: className,
    direction: 'horizontal',
    gap: gap,
    style: style,
    children: [/*#__PURE__*/_jsx(Slider, _objectSpread({
      defaultValue: defaultValue,
      disabled: disabled,
      max: max,
      min: min,
      onChange: handleOnchange,
      step: step,
      style: size === 'small' ? {
        flex: 1,
        margin: 0
      } : {
        flex: 1
      },
      tooltip: {
        open: false
      },
      value: typeof value === 'number' ? value : 0
    }, rest)), /*#__PURE__*/_jsx(InputNumber, {
      controls: size !== 'small' || controls,
      defaultValue: defaultValue,
      disabled: disabled,
      max: max,
      min: min,
      onChange: handleOnchange,
      size: size,
      step: Number.isNaN(step) || isNull(step) ? undefined : step,
      style: {
        flex: 1,
        maxWidth: size === 'small' ? 40 : 64
      },
      value: typeof value === 'number' ? value : 0
    })]
  });
});
export default SliderWithInput;