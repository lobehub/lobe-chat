import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["className", "style", "width", "height", "onLoad"];
import Spline from '@splinetool/react-spline';
import { useThemeMode } from 'antd-style';
import { memo, useState } from 'react';
import Loading from "./Loading";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var LIGHT = 'https://gw.alipayobjects.com/os/kitchen/J9jiHITGrs/scene.splinecode';
var DARK = 'https://gw.alipayobjects.com/os/kitchen/CzQKKvSE8a/scene.splinecode';
var LogoSpline = /*#__PURE__*/memo(function (_ref) {
  var className = _ref.className,
    style = _ref.style,
    width = _ref.width,
    height = _ref.height,
    _onLoad = _ref.onLoad,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useThemeMode = useThemeMode(),
    isDarkMode = _useThemeMode.isDarkMode;
  var _useState = useState(true),
    _useState2 = _slicedToArray(_useState, 2),
    loading = _useState2[0],
    setLoading = _useState2[1];
  return /*#__PURE__*/_jsxs("div", {
    className: className,
    style: _objectSpread({
      height: height,
      position: 'relative',
      width: width
    }, style),
    children: [loading && /*#__PURE__*/_jsx(Loading, {}), /*#__PURE__*/_jsx(Spline, _objectSpread({
      onLoad: function onLoad(splineApp) {
        setLoading(false);
        _onLoad === null || _onLoad === void 0 || _onLoad(splineApp);
      },
      scene: isDarkMode ? DARK : LIGHT
    }, rest))]
  });
});
export default LogoSpline;