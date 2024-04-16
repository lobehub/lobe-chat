import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, size) {
  var cx = _ref.cx,
    css = _ref.css,
    token = _ref.token,
    isDarkMode = _ref.isDarkMode,
    stylish = _ref.stylish;
  var radius;
  switch (size) {
    case 'large':
      {
        radius = token.borderRadiusLG;
        break;
      }
    case 'middle':
      {
        radius = token.borderRadius;
        break;
      }
    case 'small':
      {
        radius = token.borderRadiusSM;
        break;
      }
    default:
      {
        radius = token.borderRadius;
        break;
      }
  }
  return {
    button: cx(stylish.gradientAnimation, css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n          position: relative;\n          z-index: 1;\n          border: none;\n          border-radius: ", "px !important;\n\n          &::before {\n            content: '';\n\n            position: absolute;\n            z-index: -1;\n            inset-block-start: 1px;\n            inset-inline-start: 1px;\n\n            width: calc(100% - 2px);\n            height: calc(100% - 2px);\n\n            background: ", ";\n            border-radius: ", "px;\n          }\n\n          &:hover {\n            background: ", " !important;\n          }\n        "])), radius, token.colorBgLayout, radius - 1, token.colorPrimary)),
    glow: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n        ", "\n        position: absolute;\n        z-index: -2;\n        inset-block-start: 0;\n        inset-inline-start: 0;\n\n        width: 100%;\n        height: 100%;\n\n        opacity: ", ";\n        filter: blur(", "em);\n        border-radius: inherit;\n      "])), stylish.gradientAnimation, isDarkMode ? 0.5 : 0.3, isDarkMode ? 1.5 : 1)
  };
});