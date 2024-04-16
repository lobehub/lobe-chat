import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3;
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token,
    stylish = _ref.stylish,
    cx = _ref.cx;
  return {
    container: cx(stylish.blurStrong, css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n        position: absolute;\n        z-index: 10;\n\n        overflow: hidden;\n        grid-area: header;\n        align-self: stretch;\n\n        width: 100%;\n        height: 64px;\n\n        background: linear-gradient(\n          to bottom,\n          ", ",\n          ", "\n        );\n        border-block-end: 1px solid ", ";\n      "])), rgba(token.colorBgLayout, 0.8), rgba(token.colorBgLayout, 0.4), token.colorBorder)),
    left: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      position: relative;\n      overflow: hidden;\n      flex: 1;\n    "]))),
    right: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      position: relative;\n      overflow: hidden;\n      flex: none;\n    "])))
  };
});