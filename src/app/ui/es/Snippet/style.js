import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, type) {
  var css = _ref.css,
    cx = _ref.cx,
    token = _ref.token,
    prefixCls = _ref.prefixCls,
    stylish = _ref.stylish;
  var typeStylish = css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      background-color: ", ";\n      border: 1px solid ", ";\n    "])), type === 'block' ? token.colorFillTertiary : 'transparent', type === 'block' ? 'transparent' : token.colorBorder);
  return {
    container: cx(typeStylish, css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n          position: relative;\n\n          overflow: hidden;\n\n          max-width: 100%;\n          height: 38px;\n          padding-block: 0;\n          padding-inline: 12px 8px;\n\n          border-radius: ", "px;\n\n          transition: background-color 100ms ", ";\n\n          &:hover {\n            background-color: ", ";\n          }\n\n          .", "-highlighter-shiki {\n            position: relative;\n            overflow: hidden;\n            flex: 1;\n          }\n\n          .prism-code {\n            background: none !important;\n          }\n\n          pre {\n            ", ";\n            overflow: auto hidden !important;\n            display: flex;\n            align-items: center;\n\n            width: 100%;\n            height: 36px !important;\n            margin: 0 !important;\n\n            line-height: 1;\n\n            background: none !important;\n          }\n\n          code[class*='language-'] {\n            background: none !important;\n          }\n        "])), token.borderRadius, token.motionEaseOut, token.colorFillTertiary, prefixCls, stylish.noScrollbar))
  };
});