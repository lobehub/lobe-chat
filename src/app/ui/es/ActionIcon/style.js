import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, _ref2) {
  var css = _ref.css,
    token = _ref.token,
    stylish = _ref.stylish,
    cx = _ref.cx;
  var active = _ref2.active,
    glass = _ref2.glass;
  return {
    block: cx(glass && stylish.blur, css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n          position: relative;\n\n          flex: none;\n\n          color: ", ";\n\n          background: ", ";\n\n          transition:\n            color 600ms ", ",\n            scale 400ms ", ",\n            background-color 100ms ", ";\n        "])), active ? token.colorText : token.colorTextTertiary, active ? token.colorFillTertiary : 'transparent', token.motionEaseOut, token.motionEaseOut, token.motionEaseOut)),
    disabled: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n        cursor: not-allowed;\n        opacity: 0.5;\n      "]))),
    icon: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n        transition: scale 400ms ", ";\n\n        &:active {\n          scale: 0.8;\n        }\n      "])), token.motionEaseOut),
    normal: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n        cursor: pointer;\n\n        &:hover {\n          color: ", ";\n          background-color: ", ";\n        }\n\n        &:active {\n          color: ", ";\n          background-color: ", ";\n        }\n      "])), token.colorText, token.colorFillSecondary, token.colorText, token.colorFill)
  };
});