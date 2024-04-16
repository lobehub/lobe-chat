import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    width: 64px;\n    height: 100%;\n    min-height: 640px;\n    padding-block: 16px;\n    padding-inline: 0;\n\n    background: ", ";\n    border-inline-end: 1px solid ", ";\n  "])), token.colorBgContainer, token.colorBorder);
});