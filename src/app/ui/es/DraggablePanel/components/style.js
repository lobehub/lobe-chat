import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return {
    body: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    overflow: hidden auto;\n    padding: 16px;\n  "]))),
    container: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    position: relative;\n    overflow: hidden;\n  "]))),
    footer: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    padding-block: 8px;\n    padding-inline: 16px;\n    border-block-start: 1px solid ", ";\n  "])), token.colorBorderSecondary),
    header: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n    padding-block: 8px;\n    padding-inline: 16px;\n    font-weight: 500;\n    border-block-end: 1px solid ", ";\n  "])), token.colorBorderSecondary)
  };
});