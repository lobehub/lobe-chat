import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    position: relative;\n\n    height: 100%;\n\n    font-family: ", ";\n    font-size: 13px;\n    line-height: 1.8;\n  "])), token.fontFamilyCode);
});