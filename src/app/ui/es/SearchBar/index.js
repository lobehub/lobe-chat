'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["defaultValue", "spotlight", "className", "value", "onInputChange", "placeholder", "enableShortKey", "shortKey"];
import { Search } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import useControlledState from 'use-merge-value';
import Icon from "../Icon";
import { Input } from "../Input";
import Spotlight from "../Spotlight";
import Tag from "../Tag";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var SearchBar = /*#__PURE__*/memo(function (_ref) {
  var defaultValue = _ref.defaultValue,
    spotlight = _ref.spotlight,
    className = _ref.className,
    value = _ref.value,
    onInputChange = _ref.onInputChange,
    placeholder = _ref.placeholder,
    enableShortKey = _ref.enableShortKey,
    _ref$shortKey = _ref.shortKey,
    shortKey = _ref$shortKey === void 0 ? 'f' : _ref$shortKey,
    properties = _objectWithoutProperties(_ref, _excluded);
  var _useControlledState = useControlledState(defaultValue, {
      defaultValue: defaultValue,
      onChange: onInputChange,
      value: value
    }),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    inputValue = _useControlledState2[0],
    setInputValue = _useControlledState2[1];
  var _useState = useState('Ctrl'),
    _useState2 = _slicedToArray(_useState, 2),
    symbol = _useState2[0],
    setSymbol = _useState2[1];
  var _useState3 = useState(true),
    _useState4 = _slicedToArray(_useState3, 2),
    showTag = _useState4[0],
    setShowTag = _useState4[1];
  var _useStyles = useStyles(),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  var inputReference = useRef();
  useEffect(function () {
    var _navigator;
    if (!enableShortKey) return;
    var isAppleDevice = /(mac|iphone|ipod|ipad)/i.test(typeof navigator === 'undefined' ? '' : (_navigator = navigator) === null || _navigator === void 0 ? void 0 : _navigator.platform);
    if (isAppleDevice) {
      setSymbol('⌘');
    }
    var handler = function handler(event_) {
      if ((isAppleDevice ? event_.metaKey : event_.ctrlKey) && event_.key === shortKey) {
        var _inputReference$curre;
        event_.preventDefault();
        (_inputReference$curre = inputReference.current) === null || _inputReference$curre === void 0 || _inputReference$curre.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return function () {
      return document.removeEventListener('keydown', handler);
    };
  }, []);
  return /*#__PURE__*/_jsxs("div", {
    className: cx(styles.search, className),
    children: [spotlight && /*#__PURE__*/_jsx(Spotlight, {}), /*#__PURE__*/_jsx(Input, _objectSpread({
      allowClear: true,
      className: styles.input,
      onBlur: function onBlur() {
        return setShowTag(true);
      },
      onChange: function onChange(e) {
        setInputValue(e.target.value);
        setShowTag(!e.target.value);
      },
      onFocus: function onFocus() {
        return setShowTag(false);
      },
      placeholder: placeholder !== null && placeholder !== void 0 ? placeholder : 'Type keywords...',
      prefix: /*#__PURE__*/_jsx(Icon, {
        className: styles.icon,
        icon: Search,
        size: "small",
        style: {
          marginRight: 4
        }
      }),
      ref: inputReference,
      value: value
    }, properties)), enableShortKey && showTag && !inputValue && /*#__PURE__*/_jsxs(Tag, {
      className: styles.tag,
      children: [symbol, " ", shortKey.toUpperCase()]
    })]
  });
});
export default SearchBar;