import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token,
    prefixCls = _ref.prefixCls,
    responsive = _ref.responsive;
  return {
    form: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    position: relative;\n\n    display: flex;\n    flex-direction: column;\n    gap: 16px;\n\n    width: 100%;\n\n    ", " {\n      gap: 0;\n    }\n\n    .", "-form-item {\n      margin: 0 !important;\n    }\n\n    .", "-form-item .", "-form-item-label > label {\n      height: unset;\n    }\n\n    .", "-row {\n      position: relative;\n      flex-wrap: nowrap;\n    }\n\n    .", "-form-item-label {\n      position: relative;\n      flex: 1;\n      max-width: 100%;\n    }\n\n    .", "-form-item-row {\n      align-items: center;\n      ", " {\n        align-items: stretch;\n      }\n    }\n\n    .", "-form-item-control {\n      position: relative;\n      flex: 0;\n      min-width: unset !important;\n    }\n\n    .", "-collapse-item {\n      overflow: hidden !important;\n      border-radius: ", "px !important;\n    }\n  "])), responsive.mobile, prefixCls, prefixCls, prefixCls, prefixCls, prefixCls, prefixCls, responsive.mobile, prefixCls, prefixCls, token.borderRadius)
  };
});