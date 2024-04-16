import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4;
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    responsive = _ref.responsive,
    token = _ref.token,
    cx = _ref.cx;
  return {
    content: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    height: 64px;\n    padding-block: 0;\n    padding-inline: 24px;\n\n    background-color: ", ";\n    border-block-end: 1px solid ", ";\n\n    ", " {\n      padding-block: 0;\n      padding-inline: 12px;\n    }\n  "])), rgba(token.colorBgLayout, 0.4), token.colorSplit, responsive.mobile),
    header: cx(css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    grid-area: head;\n    align-self: stretch;\n    width: 100%;\n  "])))),
    left: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    z-index: 10;\n  "]))),
    right: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n    z-index: 10;\n\n    &-aside {\n      display: flex;\n      align-items: center;\n\n      ", " {\n        justify-content: center;\n\n        margin-block: 8px;\n        margin-inline: 16px;\n        padding-block-start: 24px;\n\n        border-block-start: 1px solid ", ";\n      }\n    }\n  "])), responsive.mobile, token.colorBorder)
  };
});