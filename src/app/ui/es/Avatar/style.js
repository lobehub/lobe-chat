import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject;
import { createStyles } from 'antd-style';
import { readableColor } from 'polished';
export var useStyles = createStyles(function (_ref, _ref2) {
  var css = _ref.css,
    token = _ref.token,
    prefixCls = _ref.prefixCls;
  var background = _ref2.background,
    size = _ref2.size,
    isEmoji = _ref2.isEmoji;
  var backgroundColor = background !== null && background !== void 0 ? background : token.colorBgContainer;
  var color = readableColor(backgroundColor);
  return {
    avatar: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n        cursor: pointer;\n\n        display: flex;\n        align-items: center;\n        justify-content: center;\n\n        background: ", ";\n        border: 1px solid ", ";\n\n        > .", "-avatar-string {\n          font-size: ", "px;\n          font-weight: 700;\n          line-height: 1 !important;\n          color: ", ";\n        }\n\n        > * {\n          cursor: pointer;\n        }\n      "])), backgroundColor, background ? 'transparent' : token.colorSplit, prefixCls, size * (isEmoji ? 0.7 : 0.5), color)
  };
});