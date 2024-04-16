import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, type) {
  var token = _ref.token,
    css = _ref.css,
    cx = _ref.cx,
    prefixCls = _ref.prefixCls,
    stylish = _ref.stylish;
  var prefix = "".concat(prefixCls, "-highlighter");
  var buttonHoverCls = "".concat(prefix, "-hover-btn");
  var langHoverCls = "".concat(prefix, "-hover-lang");
  var typeStylish = css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      background-color: ", ";\n      border: 1px solid ", ";\n\n      &:hover {\n        background-color: ", ";\n      }\n    "])), type === 'block' ? token.colorFillTertiary : 'transparent', type === 'block' ? 'transparent' : token.colorBorder, type === 'block' ? token.colorFillTertiary : token.colorFillQuaternary);
  return {
    button: cx(buttonHoverCls, css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n          position: absolute;\n          z-index: 2;\n          inset-block-start: ", ";\n          inset-inline-end: ", ";\n\n          opacity: 0;\n        "])), type === 'pure' ? 0 : '8px', type === 'pure' ? 0 : '8px')),
    container: cx(prefix, type !== 'pure' && typeStylish, css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n          position: relative;\n          overflow: auto;\n          border-radius: ", "px;\n          transition: background-color 100ms ", ";\n\n          &:hover {\n            .", " {\n              opacity: 1;\n            }\n\n            .", " {\n              opacity: 1;\n            }\n          }\n\n          .prism-code {\n            background: none !important;\n          }\n\n          pre {\n            margin: 0 !important;\n            padding: ", " !important;\n            white-space: break-spaces;\n            background: none !important;\n          }\n\n          code {\n            background: transparent !important;\n          }\n        "])), token.borderRadius, token.motionEaseOut, buttonHoverCls, langHoverCls, type === 'pure' ? 0 : "16px 24px")),
    header: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n        padding-block: 4px;\n        padding-inline: 8px;\n        background: ", ";\n      "])), token.colorFillQuaternary),
    lang: cx(langHoverCls, stylish.blur, css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n          position: absolute;\n          z-index: 2;\n          inset-block-end: 8px;\n          inset-inline-end: 0;\n\n          font-family: ", ";\n          color: ", ";\n\n          opacity: 0;\n\n          transition: opacity 0.1s;\n        "])), token.fontFamilyCode, token.colorTextSecondary)),
    select: css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n        user-select: none;\n        font-size: 14px;\n        color: ", ";\n        .", "-select-selection-item {\n          min-width: 100px;\n          padding-inline-end: 0 !important;\n          color: ", ";\n          text-align: center;\n        }\n      "])), token.colorTextDescription, prefixCls, token.colorTextDescription)
  };
});