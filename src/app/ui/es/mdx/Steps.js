'use client';

import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject;
import { createStyles } from 'antd-style';
import { jsx as _jsx } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      --lobe-markdown-header-multiple: 0.5;\n      --lobe-markdown-margin-multiple: 1;\n\n      position: relative;\n      margin-block: calc(var(--lobe-markdown-margin-multiple) * 1em);\n      padding-inline-start: 2.5em;\n\n      &::before {\n        content: '';\n\n        position: absolute;\n        inset-block-start: 0.25em;\n        inset-inline-start: 0.9em;\n\n        display: block;\n\n        width: 1px;\n        height: calc(100% - 0.5em);\n\n        background: ", ";\n      }\n\n      h3 {\n        counter-increment: step;\n\n        &::before {\n          content: counter(step);\n\n          position: absolute;\n          z-index: 1;\n          inset-inline-start: 0;\n\n          display: inline-block;\n\n          width: 1.8em;\n          height: 1.8em;\n          margin-block-start: -0.05em;\n\n          font-size: 0.8em;\n          font-weight: 500;\n          line-height: 1.8em;\n          color: ", ";\n          text-align: center;\n\n          background: ", ";\n          border-radius: 9999px;\n          box-shadow: 0 0 0 2px ", ";\n        }\n\n        &:not(:first-child) {\n          margin-block-start: 2em;\n        }\n      }\n    "])), token.colorBorderSecondary, token.colorTextSecondary, token.colorBgElevated, token.colorBgLayout)
  };
});
var Steps = function Steps(_ref2) {
  var children = _ref2.children;
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx("div", {
    className: styles.container,
    children: children
  });
};
export default Steps;