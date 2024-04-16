import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, _ref2) {
  var css = _ref.css,
    token = _ref.token,
    isDarkMode = _ref.isDarkMode;
  var _ref2$fontSize = _ref2.fontSize,
    fontSize = _ref2$fontSize === void 0 ? 14 : _ref2$fontSize,
    _ref2$headerMultiple = _ref2.headerMultiple,
    headerMultiple = _ref2$headerMultiple === void 0 ? 0.25 : _ref2$headerMultiple,
    _ref2$marginMultiple = _ref2.marginMultiple,
    marginMultiple = _ref2$marginMultiple === void 0 ? 1 : _ref2$marginMultiple,
    _ref2$lineHeight = _ref2.lineHeight,
    lineHeight = _ref2$lineHeight === void 0 ? 1.6 : _ref2$lineHeight;
  var cyanColor = isDarkMode ? token.cyan9A : token.cyan11A;
  return {
    chat: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n        --lobe-markdown-font-size: ", "px;\n        --lobe-markdown-header-multiple: ", ";\n        --lobe-markdown-margin-multiple: ", ";\n        --lobe-markdown-line-height: ", ";\n        --lobe-markdown-border-radius: ", ";\n\n        margin-block: ", "em;\n\n        ol,\n        ul {\n          li {\n            &::marker {\n              color: ", ";\n            }\n\n            li {\n              &::marker {\n                color: ", ";\n              }\n            }\n          }\n        }\n\n        ul {\n          list-style: unset;\n\n          li {\n            &::before {\n              content: unset;\n              display: unset;\n            }\n          }\n        }\n      "])), fontSize, headerMultiple, marginMultiple, lineHeight, token.borderRadius, marginMultiple * -0.75, cyanColor, token.colorTextSecondary)
  };
});