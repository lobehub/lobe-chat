import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token,
    stylish = _ref.stylish,
    cx = _ref.cx;
  return {
    icon: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    color: ", ";\n  "])), token.colorTextPlaceholder),
    input: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    position: relative;\n    padding-block: 0;\n    padding-inline: 12px 8px;\n  "]))),
    search: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    position: relative;\n    max-width: 100%;\n  "]))),
    tag: cx(stylish.blur, css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n      pointer-events: none;\n\n      position: absolute;\n      z-index: 5;\n      inset-block-start: 50%;\n      inset-inline-end: 0;\n      transform: translateY(-50%);\n\n      color: ", ";\n    "])), token.colorTextDescription))
  };
});