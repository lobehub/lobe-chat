import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject;
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
export var useStyles = createStyles(function (_ref, visible) {
  var token = _ref.token,
    css = _ref.css,
    stylish = _ref.stylish,
    cx = _ref.cx,
    responsive = _ref.responsive;
  return cx(stylish.blur, css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      pointer-events: ", ";\n\n      position: absolute;\n      inset-block-end: 16px;\n      inset-inline-end: 16px;\n      transform: translateY(", ");\n\n      padding-inline: 12px !important;\n\n      opacity: ", ";\n      background: ", ";\n      border-color: ", " !important;\n      border-radius: 16px !important;\n\n      ", " {\n        inset-inline-end: 0;\n        border-inline-end: none;\n        border-start-end-radius: 0 !important;\n        border-end-end-radius: 0 !important;\n      }\n    "])), visible ? 'all' : 'none', visible ? 0 : '16px', visible ? 1 : 0, rgba(token.colorBgContainer, 0.5), token.colorFillTertiary, responsive.mobile));
});