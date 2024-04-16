'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _excluded = ["icon", "children", "size"];
var _templateObject, _templateObject2;
import { Tag as AntTag } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { jsxs as _jsxs } from "react/jsx-runtime";
import { jsx as _jsx } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var cx = _ref.cx,
    css = _ref.css,
    token = _ref.token;
  return {
    small: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    padding-block: 2px;\n    padding-inline: 6px;\n    line-height: 1;\n  "]))),
    tag: cx(css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    user-select: none;\n    color: ", " !important;\n    background: ", ";\n    border: ", "px;\n\n    &:hover {\n      color: ", ";\n      background: ", ";\n    }\n  "])), token.colorTextSecondary, token.colorFillSecondary, token.borderRadius, token.colorText, token.colorFill))
  };
});
var Tag = /*#__PURE__*/memo(function (_ref2) {
  var icon = _ref2.icon,
    children = _ref2.children,
    _ref2$size = _ref2.size,
    size = _ref2$size === void 0 ? 'default' : _ref2$size,
    rest = _objectWithoutProperties(_ref2, _excluded);
  var _useStyles = useStyles(),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsx(AntTag, _objectSpread(_objectSpread({
    bordered: false,
    className: cx(styles.tag, size === 'small' && styles.small)
  }, rest), {}, {
    children: /*#__PURE__*/_jsxs(Flexbox, {
      align: 'center',
      gap: 4,
      horizontal: true,
      children: [icon, children]
    })
  }));
});
export default Tag;