import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      position: relative;\n\n      display: flex;\n      align-items: center;\n      justify-content: center;\n\n      line-height: 1;\n      text-align: center;\n    "])))
  };
});