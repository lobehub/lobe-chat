import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2;
import { createStyles, keyframes } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css;
  var spin = keyframes(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n  0% {\n    rotate: 0deg;\n  }\n  100% {\n    rotate: 360deg;\n  }\n  "])));
  return {
    spin: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      animation: ", " 1s linear infinite;\n    "])), spin)
  };
});