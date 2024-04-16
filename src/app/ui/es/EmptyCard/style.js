import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token,
    isDarkMode = _ref.isDarkMode;
  return {
    close: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    position: absolute;\n    inset-block-start: 8px;\n    inset-inline-end: 8px;\n  "]))),
    container: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    position: relative;\n\n    overflow: hidden;\n\n    background: linear-gradient(\n      to bottom,\n      ", ",\n      ", "\n    );\n    border: 1px solid ", ";\n    border-radius: ", "px;\n  "])), isDarkMode ? token.colorBgElevated : token.colorBgLayout, token.colorBgContainer, token.colorBorderSecondary, token.borderRadius),
    content: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    padding-block: 0 16px;\n    padding-inline: 16px;\n  "]))),
    desc: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n    color: ", ";\n  "])), token.colorTextDescription),
    image: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n    align-self: center;\n  "])))
  };
});