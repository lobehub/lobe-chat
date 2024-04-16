import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3;
import { createStyles } from 'antd-style';
import chroma from 'chroma-js';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token,
    prefixCls = _ref.prefixCls;
  return {
    avatar: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    border-radius: 50%;\n    transition:\n      scale 400ms ", ",\n      box-shadow 100ms ", ";\n\n    &:hover {\n      box-shadow: 0 0 0 3px ", ";\n    }\n\n    &:active {\n      scale: 0.8;\n    }\n  "])), token.motionEaseOut, token.motionEaseOut, token.colorText),
    picker: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    em-emoji-picker {\n      --rgb-accent: ", ";\n      --shadow: none;\n    }\n  "])), chroma(token.colorPrimary).rgb().join(',')),
    popover: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    .", "-popover-inner {\n      padding: 0;\n    }\n  "])), prefixCls)
  };
});