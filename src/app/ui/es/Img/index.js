'use client';

import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
var _excluded = ["unoptimized"];
import { createElement, forwardRef, useContext, useMemo } from 'react';
import { ConfigContext } from "../ConfigProvider";
import { jsx as _jsx } from "react/jsx-runtime";
var createContainer = function createContainer(as) {
  return /*#__PURE__*/forwardRef(function (props, ref) {
    return /*#__PURE__*/createElement(as, _objectSpread(_objectSpread({}, props), {}, {
      ref: ref
    }));
  });
};
var Img = /*#__PURE__*/forwardRef(function (_ref, ref) {
  var unoptimized = _ref.unoptimized,
    res = _objectWithoutProperties(_ref, _excluded);
  var config = useContext(ConfigContext);
  var ImgContainer = useMemo(function () {
    return createContainer((config === null || config === void 0 ? void 0 : config.imgAs) || 'img');
  }, [config]);
  return /*#__PURE__*/_jsx(ImgContainer, _objectSpread({
    ref: ref,
    unoptimized: unoptimized === undefined ? config === null || config === void 0 ? void 0 : config.imgUnoptimized : unoptimized
  }, res));
});
export default Img;