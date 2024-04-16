import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["style", "children", "backgroundColor"];
import { useTheme } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import GridBackground from "./index";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var GridShowcase = /*#__PURE__*/memo(function (_ref) {
  var style = _ref.style,
    children = _ref.children,
    _ref$backgroundColor = _ref.backgroundColor,
    backgroundColor = _ref$backgroundColor === void 0 ? '#001dff' : _ref$backgroundColor,
    rest = _objectWithoutProperties(_ref, _excluded);
  var theme = useTheme();
  return /*#__PURE__*/_jsxs("div", _objectSpread(_objectSpread({
    style: _objectSpread({
      position: 'relative'
    }, style)
  }, rest), {}, {
    children: [/*#__PURE__*/_jsx(GridBackground, {
      animation: true,
      colorBack: rgba(theme.colorText, 0.12),
      colorFront: rgba(theme.colorText, 0.6),
      flip: true
    }), /*#__PURE__*/_jsx(Flexbox, {
      align: 'center',
      style: {
        zIndex: 4
      },
      children: children
    }), /*#__PURE__*/_jsx(GridBackground, {
      animation: true,
      backgroundColor: backgroundColor,
      colorBack: rgba(theme.colorText, 0.24),
      colorFront: theme.colorText,
      random: true,
      reverse: true,
      showBackground: true,
      style: {
        zIndex: 0
      }
    })]
  }));
});
export default GridShowcase;