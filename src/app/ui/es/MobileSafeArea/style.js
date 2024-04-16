import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css;
  return {
    bottom: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      padding-block-end: env(safe-area-inset-bottom);\n    "]))),
    container: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      overflow: hidden;\n      flex: none;\n      width: 100vw;\n    "]))),
    top: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      padding-block-start: env(safe-area-inset-top);\n    "])))
  };
});