import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, _ref2) {
  var css = _ref.css,
    token = _ref.token,
    stylish = _ref.stylish,
    cx = _ref.cx;
  var type = _ref2.type;
  var typeStylish = css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      background-color: ", ";\n      border: 1px solid ", ";\n    "])), type === 'block' ? token.colorFillTertiary : token.colorFillQuaternary, type === 'block' ? 'transparent' : token.colorBorder);
  return {
    container: cx(type !== 'pure' && typeStylish, stylish.blur, css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n          position: relative;\n          padding: 2px;\n          border-radius: ", "px;\n        "])), token.borderRadius))
  };
});