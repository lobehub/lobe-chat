'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["className", "avatar", "topActions", "bottomActions"];
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var SideNav = /*#__PURE__*/memo(function (_ref) {
  var className = _ref.className,
    avatar = _ref.avatar,
    topActions = _ref.topActions,
    bottomActions = _ref.bottomActions,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsxs(Flexbox, _objectSpread(_objectSpread({
    align: 'center',
    className: cx(styles, className),
    flex: 'none',
    justify: 'space-between'
  }, rest), {}, {
    children: [/*#__PURE__*/_jsxs(Flexbox, {
      align: "center",
      direction: "vertical",
      gap: 16,
      children: [avatar, /*#__PURE__*/_jsx(Flexbox, {
        align: "center",
        direction: "vertical",
        gap: 8,
        children: topActions
      })]
    }), /*#__PURE__*/_jsx(Flexbox, {
      align: "center",
      direction: "vertical",
      gap: 4,
      children: bottomActions
    })]
  }));
});
export default SideNav;