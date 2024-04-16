import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, _ref2) {
  var cx = _ref.cx,
    css = _ref.css,
    token = _ref.token;
  var type = _ref2.type,
    resize = _ref2.resize;
  var typeStylish = css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      padding-block: 8px;\n      padding-inline: 12px;\n\n      background-color: ", ";\n      border: 1px solid ", ";\n      border-radius: ", "px;\n\n      transition:\n        background-color 100ms ", ",\n        border-color 200ms ", ";\n\n      &:hover {\n        background-color: ", ";\n        border-color: ", ";\n      }\n    "])), type === 'block' ? token.colorFillTertiary : 'transparent', type === 'block' ? 'transparent' : token.colorBorderSecondary, token.borderRadius, token.motionEaseOut, token.motionEaseOut, type === 'block' ? token.colorFillSecondary : token.colorFillQuaternary, token.colorBorder);
  return {
    container: cx(type !== 'pure' && typeStylish, css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n          overflow: hidden auto;\n          width: 100%;\n          height: fit-content;\n        "])))),
    editor: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n        resize: ", ";\n        height: fit-content;\n        min-height: 100%;\n        font-family: ", " !important;\n\n        textarea {\n          min-height: 36px !important;\n        }\n\n        pre {\n          min-height: 36px !important;\n          word-break: break-all;\n          word-wrap: break-word;\n          white-space: pre-wrap;\n\n          &.shiki {\n            margin: 0;\n          }\n        }\n      "])), resize ? 'vertical' : 'none', token.fontFamilyCode),
    textarea: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n        overflow: hidden auto;\n\n        height: 100% !important;\n\n        color: transparent !important;\n        word-break: break-all !important;\n        word-wrap: break-word !important;\n\n        caret-color: ", ";\n\n        -webkit-text-fill-color: unset !important;\n\n        &::placeholder {\n          color: ", ";\n        }\n\n        &:focus {\n          border: none !important;\n          outline: none !important;\n          box-shadow: none !important;\n        }\n      "])), token.colorText, token.colorTextQuaternary)
  };
});