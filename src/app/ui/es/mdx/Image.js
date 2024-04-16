'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["style", "width", "height", "cover", "inStep", "alt"];
import LobeImage from "../Image";
import { jsx as _jsx } from "react/jsx-runtime";
var Image = function Image(_ref) {
  var style = _ref.style,
    _ref$width = _ref.width,
    width = _ref$width === void 0 ? 800 : _ref$width,
    height = _ref.height,
    cover = _ref.cover,
    inStep = _ref.inStep,
    _ref$alt = _ref.alt,
    alt = _ref$alt === void 0 ? 'cover' : _ref$alt,
    rest = _objectWithoutProperties(_ref, _excluded);
  var size = cover ? {
    height: 300,
    width: 800
  } : inStep ? {
    height: height,
    width: 780
  } : {
    height: height,
    width: width
  };
  return /*#__PURE__*/_jsx(LobeImage, _objectSpread({
    alt: alt,
    height: size.height,
    preview: {
      mask: false
    },
    style: _objectSpread({
      borderRadius: 'calc(var(--lobe-markdown-border-radius) * 1px)',
      marginBlock: 'calc(var(--lobe-markdown-margin-multiple) * 1em)'
    }, style),
    width: size.width
  }, rest));
};
export default Image;