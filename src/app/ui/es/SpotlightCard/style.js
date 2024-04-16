import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4;
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
export var CHILDREN_CLASSNAME = 'hover-card';
export var useStyles = createStyles(function (_ref, _ref2) {
  var css = _ref.css,
    responsive = _ref.responsive,
    token = _ref.token,
    isDarkMode = _ref.isDarkMode;
  var size = _ref2.size,
    borderRadius = _ref2.borderRadius;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      &:hover > .", "::after {\n        opacity: 1;\n      }\n    "])), CHILDREN_CLASSNAME),
    content: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      z-index: 2;\n\n      flex-grow: 1;\n\n      height: 100%;\n      margin: 1px;\n\n      background: ", ";\n      border-radius: ", "px;\n    "])), token.colorBgContainer, borderRadius - 1),
    grid: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      display: grid;\n\n      ", " {\n        display: flex;\n        flex-direction: column;\n      }\n    "])), responsive.mobile),
    itemContainer: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n      cursor: pointer;\n\n      position: relative;\n\n      overflow: hidden;\n\n      width: 100%;\n\n      background: ", ";\n      border-radius: ", "px;\n\n      &::before,\n      &::after {\n        content: '';\n\n        position: absolute;\n        inset-block-start: 0;\n        inset-inline-start: 0;\n\n        width: 100%;\n        height: 100%;\n\n        opacity: 0;\n        border-radius: inherit;\n\n        transition: opacity 500ms;\n      }\n\n      &::before {\n        pointer-events: none;\n        user-select: none;\n        z-index: 3;\n        background: radial-gradient(\n          ", "px circle at var(--mouse-x) var(--mouse-y),\n          ", ",\n          transparent 40%\n        );\n      }\n\n      &::after {\n        z-index: 1;\n        background: radial-gradient(\n          ", "px circle at var(--mouse-x) var(--mouse-y),\n          ", ",\n          transparent 40%\n        );\n      }\n\n      :hover::before {\n        opacity: 1;\n      }\n    "])), rgba(token.colorBorderSecondary, 0.75), borderRadius, size, rgba(token.colorTextBase, isDarkMode ? 0.06 : 0.02), size * 0.75, rgba(token.colorTextBase, isDarkMode ? 0.4 : 0.2))
  };
});