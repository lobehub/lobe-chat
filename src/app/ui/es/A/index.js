'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
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
var A = /*#__PURE__*/forwardRef(function (props, ref) {
  var config = useContext(ConfigContext);
  var AContainer = useMemo(function () {
    return createContainer((config === null || config === void 0 ? void 0 : config.aAs) || 'a');
  }, [config]);
  return /*#__PURE__*/_jsx(AContainer, _objectSpread({
    ref: ref
  }, props));
});
export default A;