import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css;
  return {
    canvas: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    position: absolute;\n    inset: 0;\n    width: 100%;\n    height: 100%;\n  "]))),
    container: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    position: relative;\n    width: 100%;\n    height: 100%;\n  "]))),
    content: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    position: relative;\n    z-index: 1;\n    width: 100%;\n    height: 100%;\n  "])))
  };
});