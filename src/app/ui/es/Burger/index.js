'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["items", "openKeys", "selectedKeys", "opened", "setOpened", "className", "headerHeight", "onClick", "iconProps", "rootClassName", "fullscreen", "drawerProps"];
import { Drawer, Menu } from 'antd';
import { MenuIcon, X } from 'lucide-react';
import { memo } from 'react';
import { Center } from 'react-layout-kit';
import ActionIcon from "../ActionIcon";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Burger = /*#__PURE__*/memo(function (_ref) {
  var items = _ref.items,
    openKeys = _ref.openKeys,
    selectedKeys = _ref.selectedKeys,
    opened = _ref.opened,
    setOpened = _ref.setOpened,
    className = _ref.className,
    _ref$headerHeight = _ref.headerHeight,
    headerHeight = _ref$headerHeight === void 0 ? 64 : _ref$headerHeight,
    onClick = _ref.onClick,
    iconProps = _ref.iconProps,
    rootClassName = _ref.rootClassName,
    fullscreen = _ref.fullscreen,
    drawerProps = _ref.drawerProps,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles({
      fullscreen: fullscreen,
      headerHeight: headerHeight
    }),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsxs(Center, _objectSpread(_objectSpread({
    className: cx(styles.container, className),
    onClick: function onClick() {
      setOpened(!opened);
    }
  }, rest), {}, {
    children: [/*#__PURE__*/_jsx(ActionIcon, _objectSpread({
      icon: opened ? X : MenuIcon,
      size: "site"
    }, iconProps)), /*#__PURE__*/_jsxs(Drawer, _objectSpread(_objectSpread({
      closeIcon: undefined,
      open: opened,
      placement: 'left',
      width: '100vw'
    }, drawerProps), {}, {
      className: styles.drawer,
      rootClassName: cx(styles.drawerRoot, rootClassName),
      styles: {
        body: {
          padding: 0
        },
        header: {
          display: 'none'
        }
      },
      children: [/*#__PURE__*/_jsx(Menu, {
        className: styles.menu,
        items: items,
        mode: 'inline',
        onClick: onClick,
        openKeys: openKeys,
        selectedKeys: selectedKeys
      }), /*#__PURE__*/_jsx("div", {
        className: styles.fillRect
      })]
    }))]
  }));
});
export default Burger;