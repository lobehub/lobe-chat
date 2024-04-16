'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["style", "width", "height", "cover", "inStep"];
import LobeVideo from "../Video";
import { jsx as _jsx } from "react/jsx-runtime";
var Video = function Video(_ref) {
  var style = _ref.style,
    _ref$width = _ref.width,
    width = _ref$width === void 0 ? 800 : _ref$width,
    height = _ref.height,
    cover = _ref.cover,
    inStep = _ref.inStep,
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
  return /*#__PURE__*/_jsx(LobeVideo, _objectSpread({
    height: size.height,
    preview: false,
    style: _objectSpread({
      borderRadius: 'calc(var(--lobe-markdown-border-radius) * 1px)',
      marginBlock: 'calc(var(--lobe-markdown-margin-multiple) * 1em)'
    }, style),
    width: size.width
  }, rest));
};
export default Video;