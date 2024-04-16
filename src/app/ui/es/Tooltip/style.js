import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token,
    prefixCls = _ref.prefixCls;
  return {
    tooltip: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      .", "-tooltip-inner {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n\n        min-height: unset;\n        padding-block: 4px;\n        padding-inline: 8px;\n\n        color: ", ";\n        word-break: break-all;\n\n        background-color: ", ";\n        border-radius: ", "px;\n      }\n\n      .", "-tooltip-arrow {\n        &::before,\n        &::after {\n          background: ", ";\n        }\n      }\n    "])), prefixCls, token.colorBgLayout, token.colorText, token.borderRadiusSM, prefixCls, token.colorText)
  };
});