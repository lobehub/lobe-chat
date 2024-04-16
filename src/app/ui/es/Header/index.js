'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["actionsClassName", "navClassName", "logoClassName", "nav", "logo", "actions", "actionsStyle", "logoStyle", "navStyle", "className"];
import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Header = /*#__PURE__*/memo(function (_ref) {
  var actionsClassName = _ref.actionsClassName,
    navClassName = _ref.navClassName,
    logoClassName = _ref.logoClassName,
    nav = _ref.nav,
    logo = _ref.logo,
    actions = _ref.actions,
    actionsStyle = _ref.actionsStyle,
    logoStyle = _ref.logoStyle,
    navStyle = _ref.navStyle,
    className = _ref.className,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useResponsive = useResponsive(),
    mobile = _useResponsive.mobile;
  var _useStyles = useStyles(),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx("section", _objectSpread(_objectSpread({
    className: cx(styles.header, className)
  }, rest), {}, {
    children: /*#__PURE__*/_jsx(Flexbox, {
      align: 'center',
      className: styles.content,
      distribution: 'space-between',
      horizontal: true,
      width: 'auto',
      children: mobile ? /*#__PURE__*/_jsxs(_Fragment, {
        children: [/*#__PURE__*/_jsx(Flexbox, {
          className: actionsClassName,
          style: _objectSpread({
            flex: 0
          }, navStyle),
          children: nav
        }), /*#__PURE__*/_jsx(Flexbox, {
          className: cx(styles.left, logoClassName),
          horizontal: true,
          style: _objectSpread({
            flex: 1,
            overflow: 'hidden'
          }, logoStyle),
          children: logo
        }), /*#__PURE__*/_jsx(Flexbox, {
          className: actionsClassName,
          style: _objectSpread({
            flex: 0
          }, actionsStyle),
          children: actions
        })]
      }) : /*#__PURE__*/_jsxs(_Fragment, {
        children: [/*#__PURE__*/_jsx(Flexbox, {
          className: cx(styles.left, logoClassName),
          horizontal: true,
          style: _objectSpread({
            flex: 0
          }, logoStyle),
          children: logo
        }), /*#__PURE__*/_jsx(Flexbox, {
          className: navClassName,
          style: _objectSpread({
            flex: 1,
            marginLeft: 48,
            overflow: 'hidden'
          }, navStyle),
          children: nav
        }), /*#__PURE__*/_jsxs(Flexbox, {
          className: cx(styles.right, actionsClassName),
          flex: 1,
          horizontal: true,
          justify: 'space-between',
          style: actionsStyle,
          children: [/*#__PURE__*/_jsx("div", {}), /*#__PURE__*/_jsx(Flexbox, {
            align: 'center',
            gap: 8,
            horizontal: true,
            children: actions
          })]
        })]
      })
    })
  }));
});
export default Header;