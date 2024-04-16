'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
var _excluded = ["className", "size"];
import { memo, useEffect, useRef, useState } from 'react';
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var useMouseOffset = function useMouseOffset() {
  var _useState = useState(),
    _useState2 = _slicedToArray(_useState, 2),
    offset = _useState2[0],
    setOffset = _useState2[1];
  var _useState3 = useState(true),
    _useState4 = _slicedToArray(_useState3, 2),
    outside = _useState4[0],
    setOutside = _useState4[1];
  var reference = useRef();
  useEffect(function () {
    if (reference.current && reference.current.parentElement) {
      var element = reference.current.parentElement;

      // debounce?
      var onMouseMove = function onMouseMove(e) {
        var bound = element.getBoundingClientRect();
        setOffset({
          x: e.clientX - bound.x,
          y: e.clientY - bound.y
        });
        setOutside(false);
      };
      var onMouseLeave = function onMouseLeave() {
        setOutside(true);
      };
      element.addEventListener('mousemove', onMouseMove);
      element.addEventListener('mouseleave', onMouseLeave);
      return function () {
        element.removeEventListener('mousemove', onMouseMove);
        element.removeEventListener('mouseleave', onMouseLeave);
      };
    }
  }, []);
  return [offset, outside, reference];
};
var Spotlight = /*#__PURE__*/memo(function (_ref) {
  var className = _ref.className,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 64 : _ref$size,
    properties = _objectWithoutProperties(_ref, _excluded);
  var _useMouseOffset = useMouseOffset(),
    _useMouseOffset2 = _slicedToArray(_useMouseOffset, 3),
    offset = _useMouseOffset2[0],
    outside = _useMouseOffset2[1],
    reference = _useMouseOffset2[2];
  var _useStyles = useStyles({
      offset: offset,
      outside: outside,
      size: size
    }),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsx("div", _objectSpread({
    className: cx(styles, className),
    ref: reference
  }, properties));
});
export default Spotlight;