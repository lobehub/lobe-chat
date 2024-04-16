import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token,
    prefixCls = _ref.prefixCls;
  var prefix = ".".concat(prefixCls, "-tabs");
  var marginHoriz = 16;
  var paddingVertical = 6;
  return {
    compact: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      .", "-tabs-tab {\n        margin: 4px !important;\n\n        + .", "-tabs-tab {\n          margin: 4px !important;\n        }\n      }\n    "])), prefixCls, prefixCls),
    tabs: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      ", "-tab + ", "-tab {\n        margin-block: ", "px !important;\n        margin-inline: 4px !important;\n        padding-block: 0 !important;\n        padding-inline: 12px !important;\n      }\n\n      ", "-tab {\n        color: ", ";\n        transition: background-color 100ms ease-out;\n\n        &:first-child {\n          margin-block: ", "px;\n          margin-inline: 0 4px;\n          padding-block: ", "px !important;\n          padding-inline: 12px !important;\n        }\n\n        &:hover {\n          color: ", " !important;\n          background: ", ";\n          border-radius: ", "px;\n        }\n      }\n\n      ", "-nav {\n        margin-block-end: 0;\n\n        &::before {\n          display: none;\n        }\n      }\n    "])), prefix, prefix, marginHoriz, prefix, token.colorTextSecondary, marginHoriz, paddingVertical, token.colorText, token.colorFillTertiary, token.borderRadius, prefix)
  };
});