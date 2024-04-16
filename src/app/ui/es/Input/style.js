import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, _ref2) {
  var cx = _ref.cx,
    css = _ref.css,
    token = _ref.token,
    prefixCls = _ref.prefixCls;
  var type = _ref2.type;
  var typeStylish = css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      background-color: ", ";\n      border: 1px solid ", ";\n      transition:\n        background-color 100ms ", ",\n        border-color 200ms ", ";\n\n      &:hover {\n        background-color: ", ";\n      }\n\n      &:focus {\n        border-color: ", ";\n      }\n\n      &.", "-input-affix-wrapper-focused {\n        border-color: ", ";\n      }\n    "])), type === 'block' ? token.colorFillTertiary : 'transparent', type === 'block' ? 'transparent' : token.colorBorder, token.motionEaseOut, token.motionEaseOut, token.colorFillTertiary, token.colorTextQuaternary, prefixCls, token.colorTextQuaternary);
  return {
    input: cx(type !== 'pure' && typeStylish, css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n          position: relative;\n          max-width: 100%;\n          height: ", ";\n          padding: ", ";\n\n          input {\n            background: transparent;\n          }\n        "])), type === 'pure' ? 'unset' : '36px', type === 'pure' ? '0' : '0 12px')),
    textarea: cx(type !== 'pure' && typeStylish, css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n          position: relative;\n          max-width: 100%;\n          padding: ", ";\n          border-radius: ", ";\n\n          textarea {\n            background: transparent;\n          }\n        "])), type === 'pure' ? '0' : '8px 12px', type === 'pure' ? '0' : "".concat(token.borderRadius, "px")))
  };
});