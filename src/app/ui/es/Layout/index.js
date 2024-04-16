'use client';

import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["headerHeight", "children", "className", "style"],
  _excluded2 = ["children", "className"],
  _excluded3 = ["headerHeight", "children", "className", "style"],
  _excluded4 = ["headerHeight", "children", "className"],
  _excluded5 = ["tocWidth", "style", "className", "children"],
  _excluded6 = ["children", "className"];
import { useResponsive } from 'antd-style';
import { memo, useEffect, useState } from 'react';
import DraggablePanel from "../DraggablePanel";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
export var LayoutHeader = /*#__PURE__*/memo(function (_ref) {
  var headerHeight = _ref.headerHeight,
    children = _ref.children,
    className = _ref.className,
    style = _ref.style,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(headerHeight),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsxs("header", _objectSpread(_objectSpread({
    className: cx(styles.header, className),
    style: _objectSpread({
      height: headerHeight
    }, style)
  }, rest), {}, {
    children: [/*#__PURE__*/_jsx("div", {
      className: styles.glass
    }), children]
  }));
});
export var LayoutMain = /*#__PURE__*/memo(function (_ref2) {
  var children = _ref2.children,
    className = _ref2.className,
    rest = _objectWithoutProperties(_ref2, _excluded2);
  var _useStyles2 = useStyles(),
    cx = _useStyles2.cx,
    styles = _useStyles2.styles;
  return /*#__PURE__*/_jsx("main", _objectSpread(_objectSpread({
    className: cx(styles.main, className)
  }, rest), {}, {
    children: children
  }));
});
export var LayoutSidebar = /*#__PURE__*/memo(function (_ref3) {
  var headerHeight = _ref3.headerHeight,
    children = _ref3.children,
    className = _ref3.className,
    style = _ref3.style,
    rest = _objectWithoutProperties(_ref3, _excluded3);
  var _useStyles3 = useStyles(headerHeight),
    cx = _useStyles3.cx,
    styles = _useStyles3.styles;
  return /*#__PURE__*/_jsx("aside", _objectSpread(_objectSpread({
    className: cx(styles.aside, className),
    style: _objectSpread({
      top: headerHeight
    }, style)
  }, rest), {}, {
    children: children
  }));
});
export var LayoutSidebarInner = /*#__PURE__*/memo(function (_ref4) {
  var headerHeight = _ref4.headerHeight,
    children = _ref4.children,
    className = _ref4.className,
    rest = _objectWithoutProperties(_ref4, _excluded4);
  var _useStyles4 = useStyles(headerHeight),
    cx = _useStyles4.cx,
    styles = _useStyles4.styles;
  return /*#__PURE__*/_jsx("div", _objectSpread(_objectSpread({
    className: cx(styles.asideInner, className)
  }, rest), {}, {
    children: children
  }));
});
export var LayoutToc = /*#__PURE__*/memo(function (_ref5) {
  var tocWidth = _ref5.tocWidth,
    style = _ref5.style,
    className = _ref5.className,
    children = _ref5.children,
    rest = _objectWithoutProperties(_ref5, _excluded5);
  var _useStyles5 = useStyles(),
    cx = _useStyles5.cx,
    styles = _useStyles5.styles;
  return /*#__PURE__*/_jsx("nav", _objectSpread(_objectSpread({
    className: cx(styles.toc, className),
    style: tocWidth ? _objectSpread({
      width: tocWidth
    }, style) : style
  }, rest), {}, {
    children: children
  }));
});
export var LayoutFooter = /*#__PURE__*/memo(function (_ref6) {
  var children = _ref6.children,
    className = _ref6.className,
    rest = _objectWithoutProperties(_ref6, _excluded6);
  var _useStyles6 = useStyles(),
    cx = _useStyles6.cx,
    styles = _useStyles6.styles;
  return /*#__PURE__*/_jsx("footer", _objectSpread(_objectSpread({
    className: cx(styles.footer, className)
  }, rest), {}, {
    children: children
  }));
});
var Layout = /*#__PURE__*/memo(function (_ref7) {
  var helmet = _ref7.helmet,
    _ref7$headerHeight = _ref7.headerHeight,
    headerHeight = _ref7$headerHeight === void 0 ? 64 : _ref7$headerHeight,
    header = _ref7.header,
    footer = _ref7.footer,
    sidebar = _ref7.sidebar,
    asideWidth = _ref7.asideWidth,
    toc = _ref7.toc,
    children = _ref7.children,
    tocWidth = _ref7.tocWidth;
  var _useStyles7 = useStyles(headerHeight),
    styles = _useStyles7.styles;
  var _useResponsive = useResponsive(),
    mobile = _useResponsive.mobile,
    laptop = _useResponsive.laptop;
  var _useState = useState(true),
    _useState2 = _slicedToArray(_useState, 2),
    expand = _useState2[0],
    setExpand = _useState2[1];
  useEffect(function () {
    setExpand(Boolean(laptop));
  }, [laptop]);
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [helmet, header && /*#__PURE__*/_jsxs(LayoutHeader, {
      headerHeight: headerHeight,
      children: [header, mobile && toc && /*#__PURE__*/_jsx(LayoutToc, {
        children: toc
      })]
    }), /*#__PURE__*/_jsxs(LayoutMain, {
      children: [!mobile && !sidebar && /*#__PURE__*/_jsx("nav", {
        style: {
          width: tocWidth
        }
      }), !mobile && sidebar && /*#__PURE__*/_jsx(LayoutSidebar, {
        headerHeight: headerHeight,
        children: /*#__PURE__*/_jsx(DraggablePanel, {
          expand: expand,
          maxWidth: asideWidth,
          onExpandChange: setExpand,
          placement: "left",
          children: /*#__PURE__*/_jsx(LayoutSidebarInner, {
            headerHeight: headerHeight,
            children: sidebar
          })
        })
      }), /*#__PURE__*/_jsx("section", {
        className: styles.content,
        children: children
      }), !mobile && toc && /*#__PURE__*/_jsx(LayoutToc, {
        tocWidth: tocWidth,
        children: toc
      })]
    }), footer && /*#__PURE__*/_jsx(LayoutFooter, {
      children: footer
    })]
  });
});
export default Layout;