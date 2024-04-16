'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _excluded = ["icon", "title", "desc", "href", "iconProps", "image"];
var _templateObject, _templateObject2, _templateObject3;
import { createStyles } from 'antd-style';
import { Flexbox } from 'react-layout-kit';
import A from "../A";
import Icon from "../Icon";
import Img from "../Img";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    cx = _ref.cx,
    token = _ref.token;
  var icon = cx(css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    margin-block: 0.1em;\n    opacity: 0.5;\n    transition: opacity 0.2s ", ";\n  "])), token.motionEaseInOut));
  return {
    card: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      --lobe-markdown-header-multiple: 0;\n      --lobe-markdown-margin-multiple: 1;\n\n      overflow: hidden;\n\n      height: 100%;\n\n      color: ", ";\n\n      border-radius: calc(var(--lobe-markdown-border-radius) * 1px);\n      box-shadow: 0 0 0 1px var(--lobe-markdown-border-color);\n\n      transition: all 0.2s ", ";\n\n      h3,\n      p {\n        margin-block: 0;\n      }\n\n      p {\n        color: ", ";\n        transition: color 0.2s ", ";\n      }\n\n      &:hover {\n        background: ", ";\n        box-shadow: 0 0 0 1px ", ";\n\n        p {\n          color: ", ";\n        }\n\n        .", " {\n          opacity: 1;\n        }\n      }\n    "])), token.colorText, token.motionEaseInOut, token.colorTextDescription, token.motionEaseInOut, token.colorFillQuaternary, token.colorBorder, token.colorTextSecondary, icon),
    content: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      gap: 0.75em;\n      width: 100%;\n      padding: 1em;\n    "]))),
    icon: icon
  };
});
var Card = function Card(_ref2) {
  var icon = _ref2.icon,
    title = _ref2.title,
    desc = _ref2.desc,
    href = _ref2.href,
    iconProps = _ref2.iconProps,
    image = _ref2.image,
    rest = _objectWithoutProperties(_ref2, _excluded);
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx(A, {
    href: href,
    children: /*#__PURE__*/_jsxs(Flexbox, _objectSpread(_objectSpread({
      align: 'flex-start',
      className: styles.card
    }, rest), {}, {
      children: [image && /*#__PURE__*/_jsx(Img, {
        alt: title,
        height: 100,
        src: image,
        style: {
          height: 'auto',
          width: '100%'
        },
        width: 250
      }), /*#__PURE__*/_jsxs(Flexbox, _objectSpread(_objectSpread({
        align: desc ? 'flex-start' : 'center',
        className: styles.content,
        horizontal: true
      }, rest), {}, {
        children: [!image && icon && /*#__PURE__*/_jsx(Icon, _objectSpread({
          className: styles.icon,
          icon: icon,
          size: {
            fontSize: '1.5em'
          }
        }, iconProps)), /*#__PURE__*/_jsxs("div", {
          children: [/*#__PURE__*/_jsx("h3", {
            children: title
          }), desc && /*#__PURE__*/_jsx("p", {
            children: desc
          })]
        })]
      }))]
    }))
  });
};
export default Card;