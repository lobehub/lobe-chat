import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["value", "onChange", "onValueChanging", "onChangeEnd"];
import { ConfigProvider, Space } from 'antd';
import { RotateCcw, Save } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import ActionIcon from "../ActionIcon";
import { Input } from "../Input";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
export var ControlInput = /*#__PURE__*/forwardRef(function (_ref, ref) {
  var value = _ref.value,
    onChange = _ref.onChange,
    onValueChanging = _ref.onValueChanging,
    onChangeEnd = _ref.onChangeEnd,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(value || ''),
    _useState2 = _slicedToArray(_useState, 2),
    input = _useState2[0],
    setInput = _useState2[1];
  var isChineseInput = useRef(false);
  var isFocusing = useRef(false);
  var updateValue = useCallback(function () {
    onChange === null || onChange === void 0 || onChange(input);
  }, [input]);
  useEffect(function () {
    if (value !== undefined) setInput(value);
  }, [value]);
  return /*#__PURE__*/_jsx(Input, _objectSpread({
    autoFocus: true,
    onBlur: function onBlur() {
      isFocusing.current = false;
      onChangeEnd === null || onChangeEnd === void 0 || onChangeEnd(input);
    },
    onChange: function onChange(e) {
      setInput(e.target.value);
      onValueChanging === null || onValueChanging === void 0 || onValueChanging(e.target.value);
    },
    onCompositionEnd: function onCompositionEnd() {
      isChineseInput.current = false;
    },
    onCompositionStart: function onCompositionStart() {
      isChineseInput.current = true;
    },
    onFocus: function onFocus() {
      isFocusing.current = true;
    },
    onPressEnter: function onPressEnter(e) {
      if (!e.shiftKey && !isChineseInput.current) {
        e.preventDefault();
        updateValue();
        isFocusing.current = false;
        onChangeEnd === null || onChangeEnd === void 0 || onChangeEnd(input);
      }
    },
    ref: ref,
    suffix: value === input ? /*#__PURE__*/_jsx("span", {}) : /*#__PURE__*/_jsx(ConfigProvider, {
      theme: {
        token: {
          fontSize: 14
        }
      },
      children: /*#__PURE__*/_jsxs(Space, {
        size: 2,
        children: [/*#__PURE__*/_jsx(ActionIcon, {
          icon: RotateCcw,
          onClick: function onClick() {
            setInput(value);
          },
          size: "small",
          title: "Reset"
        }), /*#__PURE__*/_jsx(ActionIcon, {
          icon: Save,
          onClick: updateValue,
          size: "small",
          title: "\u2705 Save"
        })]
      })
    }),
    value: input
  }, rest));
});