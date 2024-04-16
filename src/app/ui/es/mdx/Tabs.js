'use client';

import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2;
import { createStyles } from 'antd-style';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import TabsNav from "../TabsNav";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token,
    prefixCls = _ref.prefixCls;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      --lobe-markdown-margin-multiple: 1;\n\n      margin-block: calc(var(--lobe-markdown-margin-multiple) * 1em);\n      background: ", ";\n      border-radius: calc(var(--lobe-markdown-border-radius) * 1px);\n      box-shadow: 0 0 0 1px var(--lobe-markdown-border-color);\n    "])), token.colorFillQuaternary),
    header: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      border-block-end: 1px solid var(--lobe-markdown-border-color);\n      .", "-tabs-tab-btn {\n        font-size: var(--lobe-markdown-font-size);\n        line-height: var(--lobe-markdown-line-height);\n      }\n    "])), prefixCls)
  };
});
var Tabs = function Tabs(_ref2) {
  var _ref2$defaultIndex = _ref2.defaultIndex,
    defaultIndex = _ref2$defaultIndex === void 0 ? '0' : _ref2$defaultIndex,
    items = _ref2.items,
    children = _ref2.children;
  var _useState = useState(String(defaultIndex)),
    _useState2 = _slicedToArray(_useState, 2),
    activeIndex = _useState2[0],
    setActiveIndex = _useState2[1];
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  var index = Number(activeIndex);
  return /*#__PURE__*/_jsxs(Flexbox, {
    className: styles.container,
    children: [/*#__PURE__*/_jsx(TabsNav, {
      activeKey: activeIndex,
      className: styles.header,
      items: items.map(function (item, i) {
        return {
          key: String(i),
          label: item
        };
      }),
      onChange: setActiveIndex,
      variant: 'compact'
    }), (children === null || children === void 0 ? void 0 : children[index]) || '']
  });
};
export default Tabs;