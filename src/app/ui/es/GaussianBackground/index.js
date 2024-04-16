'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["layers", "options", "className", "children", "classNames", "style"];
import { memo, useEffect, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useGaussianBackground } from "./useGaussianBackground";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var DEFAULT_OPTIONS = {
  blurRadius: 16,
  fpsCap: 60,
  scale: 16
};
var GaussianBackground = /*#__PURE__*/memo(function (_ref) {
  var layers = _ref.layers,
    _ref$options = _ref.options,
    options = _ref$options === void 0 ? DEFAULT_OPTIONS : _ref$options,
    className = _ref.className,
    children = _ref.children,
    classNames = _ref.classNames,
    style = _ref.style,
    rest = _objectWithoutProperties(_ref, _excluded);
  var ref = useRef(null);
  var _useStyles = useStyles(),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  var run = useGaussianBackground(ref);
  useEffect(function () {
    if (!run) return;
    run(layers, options);
  }, [run, options, layers]);
  return /*#__PURE__*/_jsxs("div", _objectSpread(_objectSpread({
    className: cx(styles.container, className),
    style: style
  }, rest), {}, {
    children: [/*#__PURE__*/_jsx("canvas", {
      className: cx(styles.canvas, classNames === null || classNames === void 0 ? void 0 : classNames.canvas),
      ref: ref
    }), /*#__PURE__*/_jsx(Flexbox, {
      className: cx(styles.content, classNames === null || classNames === void 0 ? void 0 : classNames.content),
      children: children
    })]
  }));
});
export default GaussianBackground;