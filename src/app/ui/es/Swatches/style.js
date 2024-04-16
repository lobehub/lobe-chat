import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, size) {
  var css = _ref.css,
    token = _ref.token;
  return {
    active: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      box-shadow: 0 0 0 2px ", ";\n    "])), token.colorTextTertiary),
    container: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      cursor: pointer;\n\n      width: ", "px;\n      height: ", "px;\n\n      background: ", ";\n      border-radius: 50%;\n      box-shadow: inset 0 0 0 2px ", ";\n\n      transition:\n        scale 400ms ", ",\n        box-shadow 100ms ", ";\n\n      &:hover {\n        box-shadow: 0 0 0 3px ", ";\n      }\n\n      &:active {\n        scale: 0.8;\n      }\n    "])), size, size, token.colorBgContainer, token.colorSplit, token.motionEaseOut, token.motionEaseOut, token.colorText)
  };
});